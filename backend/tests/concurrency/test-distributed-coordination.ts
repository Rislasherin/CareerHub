import "dotenv/config";
import { DistributedLock } from "../../src/infrastructure/distributed/DistributedLock";
import { RedisClient } from "../../src/infrastructure/redis/RedisClient";
import { Logger, LogCategory } from '../../src/infrastructure/logger/logger';

async function run() {
  Logger.info(LogCategory.SYSTEM_INFO, "=== Testing Distributed Coordination ===");

  const sessionId = "test-session-123";

  // Test 1: acquire session lease
  const acquired1 = await DistributedLock.acquireSessionLease(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 1] Worker 1 acquired lease: ${acquired1}`);

  // Test 2: duplicate acquisition
  const acquired2 = await DistributedLock.acquireSessionLease(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 2] Worker 2 acquired lease (should be false): ${acquired2}`);
  if (acquired2) throw new Error("Worker 2 should not acquire lease");

  // Test 3: renewal
  const renewed = await DistributedLock.renewSessionLease(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 3] Worker 1 renewed lease: ${renewed}`);

  // Test 4: turn lock
  const turnAcquired1 = await DistributedLock.acquireTurnLock(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 4] Worker 1 acquired turn lock: ${turnAcquired1}`);

  const turnAcquired2 = await DistributedLock.acquireTurnLock(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 4] Worker 2 acquired turn lock (should be false): ${turnAcquired2}`);

  await DistributedLock.releaseTurnLock(sessionId);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 4] Worker 1 released turn lock`);

  const turnAcquired3 = await DistributedLock.acquireTurnLock(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 4] Worker 2 acquired turn lock after release (should be true): ${turnAcquired3}`);
  
  await DistributedLock.releaseTurnLock(sessionId);

  // Test 5: expiration / worker crash takeover
  Logger.info(LogCategory.SYSTEM_INFO, "[Test 5] Simulating worker crash (waiting 6s for lease expiry)...");
  await new Promise(r => setTimeout(r, 6000));
  
  const acquired3 = await DistributedLock.acquireSessionLease(sessionId, 5000);
  Logger.info(LogCategory.SYSTEM_INFO, `[Test 5] Worker 2 acquired lease after expiry (should be true): ${acquired3}`);

  await DistributedLock.releaseSessionLease(sessionId);
  Logger.info(LogCategory.SYSTEM_INFO, "=== Distributed Coordination Tests Passed ===");

  await RedisClient.disconnect();
}

run().catch(err => Logger.error(LogCategory.SYSTEM_ERROR, "Error", err));
