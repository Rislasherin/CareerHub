import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { IAnswerEvaluator, IAnswerEvaluationResult } from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { EVALUATION_PROMPT } from "./prompts";
import { z } from "zod";
import { AnswerQuality } from "@domain/enums/AnswerQuality.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewDifficulty } from "@domain/enums/InterviewDifficulty.enum";
import { LLMProviderFactory } from "./LLMProvider.factory";

import { Metrics } from "../../observability/Metrics";
import { ProviderRateLimiter } from "./ProviderRateLimiter";
import { OllamaPriorityQueue } from "./OllamaPriorityQueue";
import { Logger, LogCategory } from '../../logger/logger';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const evaluationSchema = z.object({
  score: z.number().min(0).max(100),
  quality: z.nativeEnum(AnswerQuality),
  feedback: z.string(),
  needsFollowUp: z.boolean()
});

export class LangChainAnswerEvaluator implements IAnswerEvaluator {
  private llm: BaseChatModel;

  constructor(llm: BaseChatModel) {
    this.llm = llm;
  }

  async evaluateAnswer(input: {
    questionText: string;
    candidateAnswer: string;
    interviewContext: string;
    interviewType?: InterviewType;
    difficulty?: InterviewDifficulty;
  }): Promise<IAnswerEvaluationResult> {
    const t0 = performance.now();
    const config = LLMProviderFactory.getEvaluationConfig();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] evaluation_llm_request_start [Provider: ${config.provider}, Model: ${config.model}, Category: ${input.interviewType || 'TECHNICAL'}, Difficulty: ${input.difficulty || 'MID'}, Timeout: ${config.timeoutMs}ms]`);

    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let release: () => void;
        if (config.provider === 'OLLAMA') {
          release = await OllamaPriorityQueue.acquire('LOW');
        } else {
          release = await ProviderRateLimiter.acquire("EVALUATION_LLM", 10);
        }
        try {
          const chain = EVALUATION_PROMPT.pipe(this.llm.withStructuredOutput(evaluationSchema));
          const result = await chain.invoke({
            questionText: input.questionText,
            candidateAnswer: input.candidateAnswer,
            interviewContext: input.interviewContext,
            interviewType: input.interviewType || "TECHNICAL",
            difficulty: input.difficulty || "MID",
          }, {
            signal: AbortSignal.timeout(config.timeoutMs),
          });

          Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] LATENCY background_evaluation_duration: ${(performance.now() - t0).toFixed(2)}ms`);
          return result as IAnswerEvaluationResult;
        } finally {
          release();
        }
      } catch (err: unknown) {
        const error = err as { message?: string; response?: { headers?: Record<string, string> } };
        lastError = error instanceof Error ? error : new Error(String(error));
        Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] AI Evaluation Error (Attempt ${attempt}):`, err);
        
        // Extract Retry-After if available (e.g. from axios/fetch error)
        if (error?.response?.headers && error.response.headers['retry-after']) {
           const retryAfterStr = error.response.headers['retry-after'];
           const retryAfterSec = parseInt(retryAfterStr, 10);
           if (!isNaN(retryAfterSec)) {
               ProviderRateLimiter.applyProviderPause("EVALUATION_LLM", retryAfterSec);
           }
        }

        if (attempt < maxAttempts) {
           const backoffMs = attempt * 1500;
           Metrics.recordEvent('llm_evaluator_retry', 'FAILURE', { attempt });
           await delay(backoffMs);
        }
      }
    }

    throw new Error("Failed to evaluate answer using AI provider after max attempts. Last error: " + (lastError?.message || String(lastError)));
  }
}
