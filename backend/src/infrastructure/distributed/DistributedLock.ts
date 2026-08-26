import { RedisClient } from '../redis/RedisClient';
import { Logger, LogCategory } from '../logger/logger';
import * as crypto from 'crypto';

export class DistributedLock {
  private static workerId = crypto.randomUUID();

  /**
   * Acquires a distributed lease for an AI Interview session.
   * Prevents other workers from starting orchestration for the same session.
   */
  static async acquireSessionLease(sessionId: string, ttlMs: number = 60000): Promise<boolean> {
    try {
      const redis = RedisClient.getClient();
      const key = `session_lease:${sessionId}`;
      // SETNX with PX ensures atomic acquire + TTL
      const result = await redis.set(key, this.workerId, 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error acquiring lease for ${sessionId}`, err);
      return false; // Fail safe
    }
  }

  /**
   * Renews an existing session lease.
   */
  static async renewSessionLease(sessionId: string, ttlMs: number = 60000): Promise<boolean> {
    try {
      const redis = RedisClient.getClient();
      const key = `session_lease:${sessionId}`;
      // Only renew if we own it
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("pexpire", KEYS[1], ARGV[2])
        else
          return 0
        end
      `;
      const result = await redis.eval(script, 1, key, this.workerId, ttlMs);
      return result === 1;
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error renewing lease for ${sessionId}`, err);
      return false;
    }
  }

  /**
   * Releases a session lease cleanly upon normal completion.
   */
  static async releaseSessionLease(sessionId: string): Promise<void> {
    try {
      const redis = RedisClient.getClient();
      const key = `session_lease:${sessionId}`;
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, key, this.workerId);
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error releasing lease for ${sessionId}`, err);
    }
  }

  /**
   * Acquires a short-lived turn-processing lock to prevent duplicate answer evaluation.
   */
  static async acquireTurnLock(sessionId: string, ttlMs: number = 30000): Promise<boolean> {
    try {
      const redis = RedisClient.getClient();
      const key = `turn_lock:${sessionId}`;
      const result = await redis.set(key, this.workerId, 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error acquiring turn lock for ${sessionId}`, err);
      return false;
    }
  }

  static async releaseTurnLock(sessionId: string): Promise<void> {
    try {
      const redis = RedisClient.getClient();
      const key = `turn_lock:${sessionId}`;
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, key, this.workerId);
    } catch (err) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error releasing turn lock for ${sessionId}`, err);
    }
  }

  /**
   * Acquires a slot in a distributed semaphore for global rate limiting.
   * Returns a release function if successful, or null if it times out waiting.
   */
  static async acquireProviderSemaphore(
    providerType: string, 
    maxConcurrent: number, 
    timeoutMs: number = 10000
  ): Promise<(() => void) | null> {
    const redis = RedisClient.getClient();
    const key = `semaphore:${providerType}`;
    const clientId = crypto.randomUUID();
    const startTime = Date.now();
    const leaseTimeMs = 30000; // Protect against worker crash holding semaphore

    const script = `
      local max = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local ttl = tonumber(ARGV[3])
      local cid = ARGV[4]
      redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - ttl)
      local count = redis.call('ZCARD', KEYS[1])
      if count < max then
        redis.call('ZADD', KEYS[1], now, cid)
        return 1
      end
      return 0
    `;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const now = Date.now();
        const result = await redis.eval(script, 1, key, maxConcurrent, now, leaseTimeMs, clientId);
        if (result === 1) {
          // Successfully acquired slot
          return async () => {
            try {
              await redis.zrem(key, clientId);
            } catch(e) {}
          };
        }
        
        // Wait and retry (backoff)
        await new Promise(res => setTimeout(res, 50));
      } catch (err) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[DistributedLock] Error acquiring semaphore for ${providerType}`, err);
        return null;
      }
    }

    return null; // Timed out
  }
}
