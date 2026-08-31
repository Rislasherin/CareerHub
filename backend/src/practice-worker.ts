import 'dotenv/config';
import process from 'process';
import mongoose from 'mongoose';
import { env } from "./infrastructure/config/env.validator";
import { makePracticeWorkerOrchestrator, makeCompletePracticeInterviewUseCase, makeGeneratePracticeFeedbackUseCase } from './infrastructure/di/ai-practice.factory';
import { aiPracticeInterviewRepository, practiceRoomTokenService } from './infrastructure/di/ai-practice.factory';
import { connectDB } from './infrastructure/database/mongoose/connect';
import { PracticeInterviewStatus } from './domain/enums/PracticeInterviewStatus.enum';
import { Logger, LogCategory } from "./infrastructure/logger/logger";
import { DistributedLock } from './infrastructure/distributed/DistributedLock';
import { RedisClient } from './infrastructure/redis/RedisClient';
import { RabbitMQBroker } from './infrastructure/messaging/RabbitMQBroker';
import { IPracticeInterviewJob } from './application/interfaces/ai-practice/IPracticeInterviewJob';

const rabbitMQBroker = new RabbitMQBroker();

async function main() {
  const livekitUrl = env.LIVEKIT_URL;
  if (!livekitUrl) {
    throw new Error("LIVEKIT_URL is required in .env");
  }

  Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Starting up...`);

  try {
    await connectDB();
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] MongoDB connected.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Failed to connect to MongoDB:`, err);
    process.exit(1);
  }

  try {
    await rabbitMQBroker.connect();
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] RabbitMQ connected.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Failed to connect to RabbitMQ:`, err);
    process.exit(1);
  }

  try {
    await RedisClient.connect();
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Redis connected and ready.`);
  } catch (err) {
    Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Failed to connect to Redis:`, err);
    process.exit(1);
  }

  const MAX_CONCURRENT_SESSIONS = 25;

  await rabbitMQBroker.subscribe('ai_practice_jobs', async (msg: unknown, ack: () => void, nack: (requeue?: boolean) => void) => {
    const message = msg as IPracticeInterviewJob;
    if (message.type !== 'START_PRACTICE_INTERVIEW') {
       Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Unknown job type ${message.type}, ignoring.`);
       return ack();
    }

    const { sessionId, studentId } = message;
    if (!sessionId || !studentId) {
       Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Missing sessionId or studentId in job, ignoring.`);
       return ack();
    }

    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] JOB_RECEIVED`, { sessionId });
    
    // Validate session
    const session = await aiPracticeInterviewRepository.findByIdAndStudentId(sessionId, studentId);
    if (!session) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Session ${sessionId} not found, ignoring job.`);
      return ack();
    }
    
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] SESSION_LOADED`, { sessionId });

    if (session.status === PracticeInterviewStatus.COMPLETED || session.status === PracticeInterviewStatus.ABANDONED) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Session ${sessionId} is already finished, ignoring job.`);
      return ack();
    }

    const acquiredLease = await DistributedLock.acquireSessionLease(`practice-${sessionId}`, 60000);
    if (!acquiredLease) {
      Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Could not acquire lease for session ${sessionId}. Ignored.`);
      return ack();
    }
    
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_FLOW] LEASE_ACQUIRED`, { sessionId });

    let heartbeatInterval: NodeJS.Timeout | null = null;

    try {
      heartbeatInterval = setInterval(async () => {
        const renewed = await DistributedLock.renewSessionLease(`practice-${sessionId}`, 60000);
        if (!renewed) {
          Logger.warn(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Failed to renew lease for session ${sessionId}.`);
        }
      }, 20000);

      const roomName = `practice-${sessionId}`; // NOTE: we previously passed sessionId here, which caused mismatch
      const token = await practiceRoomTokenService.generateWorkerToken(roomName, "AI Interviewer");
      const orchestrator = makePracticeWorkerOrchestrator();

      try {
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Joining LiveKit and starting orchestration for ${sessionId}...`, {
          SESSION_ID: sessionId,
          ROOM_NAME: roomName,
          LIVEKIT_ROOM_NAME: roomName
        });
        
        const durationMs = (session.durationMinutes || 15) * 60 * 1000;
        Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Starting timer for session ${sessionId} (${session.durationMinutes} min)`);
        const timer = setTimeout(() => {
          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Time expired for session ${sessionId}, forcing completion.`);
          orchestrator.stopWorker().catch(e => Logger.error(LogCategory.SYSTEM_ERROR, "[PRACTICE_WORKER] Error stopping orchestrator on timeout", e));
        }, durationMs);

        try {
          await orchestrator.startWorker(livekitUrl, token, sessionId, studentId);
        } finally {
          clearTimeout(timer);
        }
        
        // Instead of publishing an evaluation job, we trigger completion natively as requested.
        try {
          const completeUseCase = makeCompletePracticeInterviewUseCase();
          const feedbackUseCase = makeGeneratePracticeFeedbackUseCase();

          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Triggering completion for session ${sessionId}...`);
          await completeUseCase.execute(sessionId, studentId);
          
          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Generating feedback for session ${sessionId}...`);
          await feedbackUseCase.execute(sessionId, studentId);
          
          Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Successfully completed and evaluated session ${sessionId}.`);
        } catch (evalPubErr) {
          Logger.error(LogCategory.SYSTEM_ERROR, `Failed to complete and evaluate session ${sessionId}:`, evalPubErr);
        }

        ack();
      } catch (err: unknown) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Error in startWorker for session ${sessionId}:`, err);
        nack(true); 
      } finally {
        await orchestrator.stopWorker().catch((e: unknown) => Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Error stopping orchestrator:`, e));
      }

    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[PRACTICE_WORKER] Error setting up session ${sessionId}:`, err);
      nack(true);
    } finally {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      await DistributedLock.releaseSessionLease(`practice-${sessionId}`);
    }
  }, MAX_CONCURRENT_SESSIONS);

  Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Listening for jobs on 'ai_practice_jobs' (Prefetch: ${MAX_CONCURRENT_SESSIONS})...`);
  
  const shutdown = async () => {
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Shutting down...`);
    await rabbitMQBroker.close();
    await mongoose.disconnect();
    Logger.info(LogCategory.SYSTEM_INFO, `[PRACTICE_WORKER] Disconnected.`);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  setInterval(() => {}, 10000);
}

main().catch(async (err) => {
  Logger.error(LogCategory.SYSTEM_ERROR, err);
  await rabbitMQBroker.close();
  await mongoose.disconnect();
  process.exit(1);
});
