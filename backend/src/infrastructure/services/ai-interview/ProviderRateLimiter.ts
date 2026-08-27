import { Metrics } from "../../observability/Metrics";
import { Logger, LogCategory } from "../../logger/logger";
import { DistributedLock } from "../../distributed/DistributedLock";

export class ProviderRateLimiter {
  private static pauses = new Map<string, number>();

  private static localSemaphores = new Map<string, { active: number; queue: (() => void)[] }>();

  static async acquire(providerType: string, maxConcurrent: number): Promise<() => void> {
    const pauseUntil = this.pauses.get(providerType) || 0;
    if (pauseUntil > Date.now()) {
      const waitMs = pauseUntil - Date.now();
      Logger.warn(LogCategory.SYSTEM_INFO, `[RateLimiter] ${providerType} is paused. Waiting ${waitMs}ms before acquiring...`);
      Metrics.recordEvent('provider_paused', undefined, { providerType, waitMs });
      await new Promise(res => setTimeout(res, waitMs));
    }

    // Import RedisClient dynamically or rely on it being imported above
    const { RedisClient } = require("../../redis/RedisClient");

    if (RedisClient.isReady()) {
      const release = await DistributedLock.acquireProviderSemaphore(providerType, maxConcurrent, 30000);
      if (!release) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[RateLimiter] Timed out waiting for distributed semaphore for ${providerType}`);
        return () => {};
      }
      return release;
    } else {
      Logger.warn(LogCategory.SYSTEM_INFO, `[RateLimiter] Redis is not ready. Using local in-memory semaphore for ${providerType}.`);
      return this.acquireLocal(providerType, maxConcurrent);
    }
  }

  private static acquireLocal(providerType: string, maxConcurrent: number): Promise<() => void> {
    return new Promise((resolve) => {
      let sem = this.localSemaphores.get(providerType);
      if (!sem) {
        sem = { active: 0, queue: [] };
        this.localSemaphores.set(providerType, sem);
      }

      const release = () => {
        sem!.active--;
        if (sem!.queue.length > 0) {
          const next = sem!.queue.shift();
          sem!.active++;
          if (next) next();
        }
      };

      if (sem.active < maxConcurrent) {
        sem.active++;
        resolve(release);
      } else {
        sem.queue.push(() => resolve(release));
      }
    });
  }

  static applyProviderPause(providerType: string, retryAfterSeconds: number) {
    if (retryAfterSeconds <= 0) return;
    
    const pauseUntil = Date.now() + (retryAfterSeconds * 1000);
    const currentPause = this.pauses.get(providerType) || 0;

    if (pauseUntil > currentPause) {
      this.pauses.set(providerType, pauseUntil);
      Logger.warn(LogCategory.SYSTEM_INFO, `[RateLimiter] Global pause applied for ${providerType} for ${retryAfterSeconds}s`);
      Metrics.recordEvent('rate_limit_exceeded_global_pause', 'FAILURE', { providerType, retryAfterSeconds });
    }
  }
}
