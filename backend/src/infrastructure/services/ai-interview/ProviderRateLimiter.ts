import { Metrics } from "../../observability/Metrics";
import { Logger, LogCategory } from "../../logger/logger";
import { DistributedLock } from "../../distributed/DistributedLock";

export class ProviderRateLimiter {
  private static pauses = new Map<string, number>();

  static async acquire(providerType: string, maxConcurrent: number): Promise<() => void> {
    const pauseUntil = this.pauses.get(providerType) || 0;
    if (pauseUntil > Date.now()) {
      const waitMs = pauseUntil - Date.now();
      Logger.warn(LogCategory.SYSTEM_INFO, `[RateLimiter] ${providerType} is paused. Waiting ${waitMs}ms before acquiring...`);
      Metrics.recordEvent('provider_paused', undefined, { providerType, waitMs });
      await new Promise(res => setTimeout(res, waitMs));
    }

    const release = await DistributedLock.acquireProviderSemaphore(providerType, maxConcurrent, 30000);
    if (!release) {
      Logger.error(LogCategory.SYSTEM_ERROR, `[RateLimiter] Timed out waiting for distributed semaphore for ${providerType}`);
      return () => {};
    }

    return release;
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
