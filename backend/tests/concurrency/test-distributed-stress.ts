import "dotenv/config";
import { DistributedLock } from "../../src/infrastructure/distributed/DistributedLock";
import { ProviderRateLimiter } from "../../src/infrastructure/services/ai-interview/ProviderRateLimiter";
import { RedisClient } from "../../src/infrastructure/redis/RedisClient";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function simulateWorker(workerId: number, sessionId: string) {
  const acquired = await DistributedLock.acquireSessionLease(sessionId, 30000);
  if (!acquired) {
    Logger.info(LogCategory.SYSTEM_INFO, `[Worker ${workerId}] Failed to acquire session ${sessionId}`);
    return;
  }
  
  Logger.info(LogCategory.SYSTEM_INFO, `[Worker ${workerId}] Acquired session ${sessionId}`);
  
  // Simulate doing work and hitting provider limits
  const tasks = [];
  for (let i = 0; i < 3; i++) {
    tasks.push((async () => {
      const release = await ProviderRateLimiter.acquire("QUESTION_LLM", 5);
      Logger.info(LogCategory.SYSTEM_INFO, `[Worker ${workerId}] Acquired provider slot`);
      await new Promise(r => setTimeout(r, 500));
      release();
      Logger.info(LogCategory.SYSTEM_INFO, `[Worker ${workerId}] Released provider slot`);
    })());
  }
  
  await Promise.all(tasks);
  
  await DistributedLock.releaseSessionLease(sessionId);
  Logger.info(LogCategory.SYSTEM_INFO, `[Worker ${workerId}] Released session ${sessionId}`);
}

async function run() {
  Logger.info(LogCategory.SYSTEM_INFO, "=== Testing Distributed Stress (Global Concurrency) ===");

  const workers = [];
  
  // Launch 10 workers fighting for 3 sessions
  for (let w = 1; w <= 10; w++) {
    for (let s = 1; s <= 3; s++) {
      workers.push(simulateWorker(w, `session-${s}`));
    }
  }

  await Promise.all(workers);
  
  Logger.info(LogCategory.SYSTEM_INFO, "=== Stress Test Completed ===");
  await RedisClient.disconnect();
}

run().catch(err => Logger.error(LogCategory.SYSTEM_ERROR, "Error", err));
