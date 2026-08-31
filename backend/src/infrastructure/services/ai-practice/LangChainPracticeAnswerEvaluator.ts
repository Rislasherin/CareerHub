import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  IPracticeAnswerEvaluator,
  IPracticeAnswerEvaluation,
} from "@application/interfaces/ai-practice/IPracticeAnswerEvaluator";
import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";
import { PRACTICE_EVALUATION_PROMPT } from "./prompts";
import { z } from "zod";

const practiceEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string(),
});

type PracticeEvaluationResult = z.infer<typeof practiceEvaluationSchema>;

export class LangChainPracticeAnswerEvaluator implements IPracticeAnswerEvaluator {
  constructor(private readonly _llm: BaseChatModel) {}

  async evaluateAnswer(input: {
    difficulty: PracticeDifficulty;
    question: string;
    answer: string;
    topic: string;
  }): Promise<IPracticeAnswerEvaluation> {
    // withStructuredOutput returns Runnable<unknown, unknown> in some LangChain versions;
    // we cast the result to our typed schema after invocation.
    const structuredLLM = this._llm.withStructuredOutput(practiceEvaluationSchema);
    const chain = PRACTICE_EVALUATION_PROMPT.pipe(structuredLLM);

    const raw = await chain.invoke({
      difficulty: input.difficulty,
      question: input.question,
      answer: input.answer,
      topic: input.topic,
    });

    // Safe cast — Zod validates the shape before this point via withStructuredOutput
    const result = raw as PracticeEvaluationResult;

    return {
      score: result.score,
      feedback: result.feedback,
    };
  }
}
