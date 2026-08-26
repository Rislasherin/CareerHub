import { IAIInterviewRepository } from "@domain/repositories/ai-interview/IAIInterviewRepository";
import { IProcessStudentAnswerUseCase, ProcessStudentAnswerOutput } from "../interfaces/IProcessStudentAnswerUseCase";
import { ProcessStudentAnswerInputDTO } from "@application/dtos/ai-interview/ProcessStudentAnswer.dto";
import { 
  IInterviewAIOrchestrator, 
  AIOrchestrationAction, 
  CandidateAnswerQuality,
  AdaptiveInterviewDifficulty 
} from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";
import { assessCandidateAnswerQuality } from "@shared/utils/answerQuality.util";
import { extractMentionedTechnologies } from "../../../../shared/utils/technologyExtractor.util";
import { IMessageBroker } from "@application/interfaces/messaging/IMessageBroker";
import { InterviewQuestion } from "@domain/entities/ai-interview/InterviewQuestion";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import * as crypto from "crypto";

import { IDistributedLockService } from "../../../interfaces/distributed/IDistributedLockService";
import { ILogger, LogCategory } from "../../../interfaces/observability/ILogger";


export class ProcessStudentAnswerUseCase implements IProcessStudentAnswerUseCase {
  constructor(
    private readonly _repository: IAIInterviewRepository,
    private readonly _orchestrator: IInterviewAIOrchestrator,
    private readonly _messageBroker?: IMessageBroker,
    private readonly _distributedLock?: IDistributedLockService,
    private readonly _logger?: ILogger
  ) {}

  async execute(input: ProcessStudentAnswerInputDTO): Promise<ProcessStudentAnswerOutput> {
    // Attempt to acquire distributed turn lock to prevent parallel transcription processing for the same turn
    if (this._distributedLock) {
      const turnLocked = await this._distributedLock.acquireTurnLock(input.sessionId, 30000); // 30s lock
      if (!turnLocked) {
        if (this._logger) {
          this._logger.warn(LogCategory.SYSTEM_INFO, `[ProcessStudentAnswerUseCase] Turn lock could not be acquired for session ${input.sessionId}. Ignoring potentially concurrent/duplicate answer.`);
        }
        return { success: false };
      }
    }

    try {
      // 1. Fetch Session
      const session = await this._repository.findById(input.sessionId);
      if (!session) {
        throw new Error(`AI Interview session with ID ${input.sessionId} not found`);
      }

      // 2. Fetch the current question from the domain entity
      const currentQuestion = session.questions.find((q) => q.id === input.questionId);
      if (!currentQuestion) {
        throw new Error(`Question with ID ${input.questionId} not found in session.`);
      }

      // 2.1 Validate Authorization
      if (session.studentId !== input.studentId) {
        throw new Error(`Forbidden: Session does not belong to the requesting student.`);
      }

      if (session.phase === InterviewPhase.COMPLETED || session.phase === InterviewPhase.CLOSING) {
        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[ProcessStudentAnswerUseCase] Session ${input.sessionId} is already ${session.phase}. Ignoring answer.`);
        }
        return { success: false };
      }

      // 3. Domain Logic: Claim the answer atomically in DB to lock the turn
      const claimed = await this._repository.recordAnswerAtomically(input.sessionId, input.questionId, input.answer);
      if (!claimed) {
        if (this._logger) {
          this._logger.info(LogCategory.SYSTEM_INFO, `[ProcessStudentAnswerUseCase] Answer already recorded for question ${input.questionId} or session invalid state. Ignoring concurrent duplicate.`);
        }
        return { success: false };
      }

      // Update the in-memory session domain object for subsequent logic
      session.recordAnswer(input.questionId, input.answer);

    const elapsedMs = session.startedAt ? Date.now() - session.startedAt.getTime() : 0;
    const durationMs = session.getDurationMinutes() * 60 * 1000;
    const timeRemainingMs = Math.max(0, durationMs - elapsedMs);
    const interviewContext = session.interviewContext || "Professional Technical & Behavioral Competency Evaluation.";
    const config = session.configuration;

    // Extract conversation context (bounded)
    const answeredTexts = session.questions
      .map(q => q.candidateAnswer)
      .filter((a): a is string => Boolean(a));
    const mentionedTechnologies = extractMentionedTechnologies(answeredTexts);
    const recentQuestions = session.questions.map(q => q.text).slice(-5);
    const recentAnswers = session.questions
      .filter(q => q.candidateAnswer)
      .map(q => ({ question: q.text, answer: q.candidateAnswer! }))
      .slice(-5);
    const recentAnswerQualities = session.questions
      .filter(q => q.candidateAnswer && q.id !== input.questionId)
      .map(q => assessCandidateAnswerQuality(q.text, q.candidateAnswer!))
      .slice(-5);

    // 4. Call LangGraph AI Orchestrator (Deterministic Realtime Interaction Path)
    const aiResult = await this._orchestrator.processAnswer({
      sessionId: session.id,
      candidateAnswer: input.answer,
      currentQuestion: {
        id: currentQuestion.id,
        text: currentQuestion.text,
        type: currentQuestion.type,
        context: currentQuestion.context,
      },
      interviewContext,
      onSentenceGenerated: input.onSentenceGenerated,
      currentTopic: session.currentTopic || "None",
      coveredTopics: [...session.coveredTopics],
      followUpCount: session.followUpCount,
      recentQuestions,
      recentAnswers,
      recentAnswerQualities,
      mentionedTechnologies,
      interviewPlan: session.interviewPlan,
      interviewType: session.interviewPlan?.getNextItem()?.category || config?.primaryType,
      difficulty: config?.difficulty,
      customInstructions: config ? [...config.customInstructions] : [],
      prohibitedTopics: config ? [...config.prohibitedTopics] : [],
      timeRemainingMs,
      abortSignal: input.abortSignal
    });

    if (input.abortSignal?.aborted) {
       if (this._logger) {
         this._logger.info(LogCategory.SYSTEM_INFO, "[ProcessStudentAnswerUseCase] Processing aborted due to timeout.");
       }
       return { success: false };
    }

    // 5. Domain Logic: Move to next question immediately
    session.startEvaluation(); // Temporarily enter evaluation phase to satisfy state machine
    
    if (
      aiResult.action === AIOrchestrationAction.ASK_FOLLOW_UP || 
      aiResult.action === AIOrchestrationAction.ASK_NEXT_QUESTION
    ) {
      if (aiResult.nextQuestion) {
        const nextQ = new InterviewQuestion({
          id: crypto.randomUUID(), 
          text: aiResult.nextQuestion.text,
          type: aiResult.nextQuestion.type,
          context: aiResult.nextTopic || aiResult.nextQuestion.context,
          category: aiResult.nextCategory || currentQuestion.category || InterviewType.TECHNICAL,
        });

        if (aiResult.action === AIOrchestrationAction.ASK_FOLLOW_UP) {
          session.requestFollowUp(nextQ);
        } else {
          session.moveToQuestion(nextQ, aiResult.nextTopic || aiResult.nextQuestion.context, aiResult.nextCategory);
        }

        // 6. Save atomically
        const advanced = await this._repository.advanceInterviewAtomically(
            session.id,
            nextQ,
            session.phase,
            session.currentTopic || "None",
            [...session.coveredTopics],
            session.followUpCount,
            session.interviewPlan
        );
        if (!advanced) {
           if (this._logger) {
             this._logger.error(LogCategory.SYSTEM_ERROR, `[ProcessStudentAnswerUseCase] Failed to advance interview state atomically for session ${session.id}`);
           }
        }
      }
    } else if (aiResult.action === AIOrchestrationAction.COMPLETE_INTERVIEW) {
      session.closeInterview();
      await this._repository.transitionSessionState(
          session.id,
          [InterviewPhase.ASKING_QUESTION, InterviewPhase.ASKING_FOLLOW_UP, InterviewPhase.EVALUATING],
          InterviewPhase.CLOSING
      );
    }

    // 7. Background Evaluation via Dedicated RabbitMQ Queue Isolation
    if (this._messageBroker) {
      this._messageBroker.publish('ai_interview_evaluations', {
        type: 'EVALUATE_ANSWER',
        sessionId: session.id,
        questionId: input.questionId,
        questionText: currentQuestion.text,
        candidateAnswer: input.answer,
        interviewContext,
        interviewType: currentQuestion.category || config?.primaryType || InterviewType.TECHNICAL,
        difficulty: config?.difficulty,
        enqueuedAt: Date.now()
      }).catch(err => {
        if (this._logger) {
          this._logger.error(LogCategory.SYSTEM_ERROR, "[ProcessStudentAnswerUseCase] Failed to publish evaluation job to RabbitMQ:", err);
        }
      });
    }

    return {
      success: true
    };
    
    } finally {
      if (this._distributedLock) {
        await this._distributedLock.releaseTurnLock(input.sessionId);
      }
    }
  }
}
