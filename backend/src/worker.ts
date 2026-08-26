import 'dotenv/config';
import process from 'process';
import mongoose from 'mongoose';
import { env } from "./infrastructure/config/env.validator";
import { makeAIWorkerOrchestrator, liveKitService, rabbitMQBroker, aiInterviewRepository, aiAnswerEvaluator } from './infrastructure/di/ai-interview.factory';
import { connectDB } from './infrastructure/database/mongoose/connect';
import { InterviewPhase } from './domain/enums/InterviewPhase.enum';
import { Logger, LogCategory } from "./infrastructure/logger/logger";
import { Metrics } from "./infrastructure/observability/Metrics";
import { DistributedLock } from './infrastructure/distributed/DistributedLock';
import { RedisClient } from './infrastructure/redis/RedisClient';

async function main() {
  const livekitUrl = env.LIVEKIT_URL;
  if (!livekitUrl) {
    throw new Error("LIVEKIT_URL is required in .env");
  }

  Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Starting up...`);

  const orchestrator = makeAIWorkerOrchestrator();

  try {
    await connectDB();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] MongoDB connected.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to connect to MongoDB:`, err);
    process.exit(1);
  }

  try {
    await rabbitMQBroker.connect();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] RabbitMQ connected.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to connect to RabbitMQ:`, err);
    process.exit(1);
  }

  try {
    await RedisClient.connect();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Redis connected.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Failed to connect to Redis:`, err);
    process.exit(1);
  }

  const MAX_CONCURRENT_SESSIONS = 25;

  await rabbitMQBroker.subscribe('ai_interview_jobs', async (msg: unknown, ack: () => void, nack: (requeue?: boolean) => void) => {
    const message = msg as { type?: string; sessionId?: string };
    if (message.type !== 'START_AI_INTERVIEW') {
       Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Unknown job type ${message.type}, ignoring.`);
       return ack();
    }

    const sessionId = message.sessionId;
    if (!sessionId) {
       Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] No sessionId in job, ignoring.`);
       return ack();
    }

    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Received job for session ${sessionId}`);
    
    // Validate session
    const session = await aiInterviewRepository.findById(sessionId);
    if (!session) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Session ${sessionId} not found, ignoring job.`);
      return ack();
    }

    if (session.phase === InterviewPhase.COMPLETED || session.phase === InterviewPhase.CLOSING) {
      Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Session ${sessionId} is already completed, ignoring job.`);
      return ack();
    }

    // Try to acquire distributed session lease
    const acquiredLease = await DistributedLock.acquireSessionLease(sessionId, 60000);
    if (!acquiredLease) {
      Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Could not acquire lease for session ${sessionId}, another worker might be handling it.`);
      // Nack without requeue if we assume it's a duplicate or being handled safely.
      // But actually, if we want it to retry later if the other worker crashes, we can nack with requeue
      // Or we can just ack it because the other worker already received its own message.
      // Since HTTP layer might publish duplicates, let's just ack it.
      return ack();
    }

    let heartbeatInterval: NodeJS.Timeout | null = null;

    try {
      // Start heartbeat to renew lease every 20 seconds while active
      heartbeatInterval = setInterval(async () => {
        const renewed = await DistributedLock.renewSessionLease(sessionId, 60000);
        if (!renewed) {
          Logger.warn(LogCategory.SYSTEM_INFO, `[AI_WORKER] Failed to renew lease for session ${sessionId}.`);
        }
      }, 20000);

      // Use the liveKitService to generate the worker token
      const token = await liveKitService.generateWorkerToken(sessionId);

      // Instantiate the application orchestrator
      const orchestrator = makeAIWorkerOrchestrator();

      try {
        Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Joining LiveKit and starting orchestration for ${sessionId}...`);
        
        // Wait until startWorker resolves or rejects. 
        // This holds the RabbitMQ consumer from receiving a new job until this one finishes!
        // We only acknowledge the job after the interview is completely finished.
        await orchestrator.startWorker(livekitUrl, token, sessionId);
        
        Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Finished processing session ${sessionId}`);
        ack(); // Acknowledge completion ONLY when finished
      } catch (err: unknown) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Error in startWorker for session ${sessionId}:`, err);
        // Nack so another worker can try, or DLQ if it fails too many times
        nack(true); 
      } finally {
        await orchestrator.stopWorker().catch((e: unknown) => Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Error stopping orchestrator during cleanup:`, e));
      }

    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[AI_WORKER] Error setting up session ${sessionId}:`, err);
      nack(true); // Requeue
    } finally {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      await DistributedLock.releaseSessionLease(sessionId);
    }
  }, MAX_CONCURRENT_SESSIONS);

  Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Listening for jobs on 'ai_interview_jobs' (Prefetch: ${MAX_CONCURRENT_SESSIONS})...`);

  const MAX_CONCURRENT_EVALS = 10;
  await rabbitMQBroker.subscribe('ai_interview_evaluations', async (msg: unknown, ack: () => void, nack: (requeue?: boolean, allUpTo?: boolean) => void) => {
    try {
      if (!msg || typeof msg !== 'object') {
        Logger.error(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Received malformed non-object message`, new Error('Malformed msg'));
        return nack(false, false); // Dead-letter immediately
      }

      const evalMsg = msg as {
        type?: string;
        sessionId?: string;
        questionId?: string;
        questionText?: string;
        candidateAnswer?: string;
        interviewContext?: string;
        interviewType?: string;
        difficulty?: string;
        enqueuedAt?: number;
        retries?: number;
      };

      if (evalMsg.type !== 'EVALUATE_ANSWER') {
        Logger.warn(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Unknown evaluation job type: ${evalMsg.type}, acknowledging and ignoring.`);
        return ack();
      }

      const { sessionId, questionId, questionText, candidateAnswer, interviewContext, interviewType, difficulty, enqueuedAt, retries = 0 } = evalMsg;
      const t_eval_start = performance.now();
      const queueWaitMs = enqueuedAt ? (Date.now() - enqueuedAt) : 0;
      
      if (!sessionId || !questionId) {
        Logger.error(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Missing sessionId or questionId in job`, new Error('Invalid payload'));
        return nack(false, false);
      }

      Logger.info(LogCategory.SYSTEM_INFO, `[AI_EVALUATION_WORKER] Received evaluation job for session ${sessionId}, question ${questionId}`, { queueWaitMs, attempt: retries + 1 });

      const bgSession = await aiInterviewRepository.findById(sessionId);
      if (!bgSession) {
        Logger.error(LogCategory.AI_INTERVIEW_DB_FAILURE, `Session ${sessionId} not found for evaluation.`);
        return ack();
      }

      const q = bgSession.questions.find((q: { id: string }) => q.id === questionId);
      if (!q) {
         Logger.error(LogCategory.AI_INTERVIEW_DB_FAILURE, `Question ${questionId} not found in session.`);
         return ack();
      }

      if (q.evaluation) {
         Logger.info(LogCategory.SYSTEM_INFO, `Question ${questionId} is already evaluated. Skipping duplicate delivery.`);
         return ack();
      }

      // Security Isolation: Read directly from DB to prevent payload spoofing
      const authoritativeQuestionText = q.text;
      const authoritativeCandidateAnswer = q.candidateAnswer || candidateAnswer; // fallback to payload only if empty (should never happen)

      const t_llm_start = performance.now();
      const evalResult = await aiAnswerEvaluator.evaluateAnswer({
        questionText: authoritativeQuestionText,
        candidateAnswer: authoritativeCandidateAnswer,
        interviewContext,
        interviewType,
        difficulty,
      });
      const t_llm_end = performance.now();
      Metrics.recordLatency('worker_answer_evaluation_duration', t_llm_end - t_llm_start, 'evaluator', { queueWaitMs, attempt: retries + 1 });

      if (evalResult) {
        const attached = await aiInterviewRepository.attachEvaluationAtomically(
            sessionId,
            questionId,
            {
               score: evalResult.score,
               quality: evalResult.quality,
               feedback: evalResult.feedback,
               needsFollowUp: evalResult.needsFollowUp,
            }
        );
        if (attached) {
            Metrics.recordEvent('evaluation_attached_successfully');
            Logger.info(LogCategory.SYSTEM_INFO, `Evaluation successfully attached for question ${questionId}`);
        } else {
            Metrics.recordEvent('evaluation_duplicate_ignored');
            Logger.warn(LogCategory.SYSTEM_INFO, `Evaluation already attached or session modified for question ${questionId}. Ignored duplicate.`);
        }
        
        // If the session was already completed, recalculate final result
        if (bgSession.phase === InterviewPhase.COMPLETED) {
           Logger.info(LogCategory.SYSTEM_INFO, `Session ${sessionId} was already completed. Late evaluation recorded successfully.`);
        }
      }
      ack();
    } catch (err: unknown) {
      const evalMsg = msg as { questionId?: string; retries?: number } | null;
      const questionId = evalMsg?.questionId || 'unknown';
      const retries = evalMsg?.retries || 0;
      Logger.error(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Evaluation job failed for question ${questionId} (Attempt ${retries + 1})`, err);
      
      if (retries < 2) {
        Logger.info(LogCategory.SYSTEM_INFO, `Re-enqueuing evaluation job for question ${questionId} (Next attempt: ${retries + 2})`);
        try {
          await rabbitMQBroker.publish('ai_interview_evaluations', {
            ...(msg as object),
            retries: retries + 1,
            enqueuedAt: Date.now()
          });
          ack(); // Ack the current failing one since we re-published a retry
        } catch (publishErr) {
          Logger.error(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Failed to re-publish retry for ${questionId}`, publishErr);
          nack(false, true); // Requeue natively if manual republish fails
        }
      } else {
        Logger.error(LogCategory.AI_INTERVIEW_RABBIT_FAILURE, `Permanent failure for evaluation job ${questionId} after 3 attempts. Discarding to avoid queue blockage.`, err);
        nack(false); // DLX
      }
    }
  }, MAX_CONCURRENT_EVALS);

  Logger.info(LogCategory.SYSTEM_INFO, `[AI_EVALUATION_WORKER] Listening for evaluation jobs on 'ai_interview_evaluations' (Prefetch: ${MAX_CONCURRENT_EVALS})...`);
  
  // Setup graceful shutdown
  const shutdown = async () => {
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Shutting down...`);
    await rabbitMQBroker.close();
    await mongoose.disconnect();
    Logger.info(LogCategory.SYSTEM_INFO, `[AI_WORKER] Disconnected.`);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Prevent process from exiting
  setInterval(() => {}, 10000);
}

main().catch(async (err) => {
  Logger.error(LogCategory.SYSTEM_ERROR, err);
  await rabbitMQBroker.close();
  await mongoose.disconnect();
  process.exit(1);
});
