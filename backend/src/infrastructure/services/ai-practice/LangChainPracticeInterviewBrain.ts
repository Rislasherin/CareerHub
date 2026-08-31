import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  IPracticeInterviewBrain,
  IPracticeBrainContext,
  IPracticeBrainDecision,
  PracticeAction,
} from "../../../application/interfaces/ai-practice/IPracticeInterviewBrain";
import { IPracticeQuestionGenerator } from "../../../application/interfaces/ai-practice/IPracticeQuestionGenerator";
import { Logger, LogCategory } from "../../logger/logger";

// ─────────────────────────────────────────────────────────────────────────────
// LATENCY OPTIMISATION — Two-stage approach
//
// OLD (50s):
//   Single withStructuredOutput call producing {action, responseText, nextQuestion,
//   topic, reason} — the LLM had to generate a complete JSON object with the full
//   next question text before returning anything, serialised as structured output.
//
// NEW (<3s expected):
//   Stage 1 — Tiny routing schema: {action, transitionPhrase}
//     - action:  FOLLOW_UP | CLARIFICATION | NEXT_QUESTION | END_INTERVIEW
//     - transitionPhrase: ≤ 15-word spoken acknowledgment before the next question
//     - Total output: ~30 tokens → fast on any LLM
//
//   Stage 2 (if NEXT_QUESTION/FOLLOW_UP/CLARIFICATION) — question text from
//     IPracticeQuestionGenerator, which uses the streaming PRACTICE_QUESTION_PROMPT
//     (dedicated short-question model, already tuned for conciseness).
//
//   Both stages run sequentially but each is small.
//   The realtime path never waits for a monolithic structured JSON blob.
// ─────────────────────────────────────────────────────────────────────────────


export class LangChainPracticeInterviewBrain implements IPracticeInterviewBrain {
  constructor(
    private readonly chatModel: BaseChatModel,
    private readonly _questionGenerator: IPracticeQuestionGenerator
  ) {}

  async processTurn(context: IPracticeBrainContext): Promise<IPracticeBrainDecision> {
    const t_start = performance.now();
    Logger.info(
      LogCategory.SYSTEM_INFO,
      `[PRACTICE_LATENCY] BRAIN_START`,
      { currentQuestion: context.currentQuestion.substring(0, 60) }
    );

    // ── Time guard ──────────────────────────────────────────────────────────
    // Reserve 10 seconds of buffer for TTS + playout at end of session.
    if (context.timeRemainingMs <= 10000) {
      Logger.info(
        LogCategory.SYSTEM_INFO,
        `[LangChainPracticeInterviewBrain] Time expired (${Math.round(context.timeRemainingMs / 1000)}s remaining). Forcing END_INTERVIEW.`
      );
      return {
        action: PracticeAction.END_INTERVIEW,
        responseText:
          "That wraps up your practice session for today. Great effort — your feedback will be ready shortly.",
        reason: "Time expired.",
      };
    }

    // ── Stage 1: Deterministic Routing (Bypass LLM completely) ─────────────
    // Instead of using an LLM to decide NEXT_QUESTION vs FOLLOW_UP, we use
    // simple heuristics, or just default to NEXT_QUESTION to maximize speed.
    // The question generator LLM will read the context and adjust naturally.
    
    // Simple heuristic for FOLLOW_UP: candidate gave an extremely short answer.
    let action = PracticeAction.NEXT_QUESTION;
    const answerWords = context.candidateAnswer.trim().split(/\s+/).length;
    if (answerWords < 15 && context.followUpCount < 2) {
      action = PracticeAction.FOLLOW_UP;
    } else if (context.followUpCount >= 2) {
      action = PracticeAction.NEXT_QUESTION;
    }

    const nextTopic = context.currentTopic; // Keeping on topic for speed.
    
    // ── Stage 2: Generate question text (fast streaming question generator) ─
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_LATENCY] QUESTION_GENERATION_START`, {
      action,
      topic: nextTopic,
    });

    const allQuestions = [...context.previousQuestions, context.currentQuestion];
    const allAnswers = [...context.previousAnswers, context.candidateAnswer];

    let questionText: string;
    try {
      questionText = await this._questionGenerator.generateQuestion({
        difficulty: context.difficulty as import("@domain/enums/PracticeDifficulty.enum").PracticeDifficulty,
        topics: context.selectedTopics,
        previousQuestions: allQuestions,
        previousAnswers: allAnswers,
        currentTopic: nextTopic,
      });
    } catch (err) {
      Logger.error(
        LogCategory.SYSTEM_ERROR,
        `[LangChainPracticeInterviewBrain] Question generator error, using fallback:`,
        err
      );
      questionText = `Got it. Can you walk me through a practical example of how you've used ${nextTopic}?`;
    }

    const t_q_done = performance.now();
    Logger.info(
      LogCategory.SYSTEM_INFO,
      `[PRACTICE_LATENCY] QUESTION_GENERATED`,
      {
        durationMs: Math.round(t_q_done - t_start),
        totalMs: Math.round(t_q_done - t_start),
        questionLen: questionText.length,
      }
    );
    Logger.info(
      LogCategory.SYSTEM_INFO,
      `[PRACTICE_LATENCY] BRAIN_COMPLETE`,
      { totalMs: Math.round(t_q_done - t_start), action }
    );

    // The question text now natively contains the transition phrase.
    return {
      action,
      responseText: questionText,
      nextQuestion: questionText,
      topic: nextTopic,
      reason: "Deterministic routing",
    };
  }
}
