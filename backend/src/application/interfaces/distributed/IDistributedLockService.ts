export interface IDistributedLockService {
  acquireTurnLock(sessionId: string, ttlMs?: number): Promise<boolean>;
  releaseTurnLock(sessionId: string): Promise<void>;
  acquireSessionLease(sessionId: string, ttlMs?: number): Promise<boolean>;
  renewSessionLease(sessionId: string, ttlMs?: number): Promise<boolean>;
  releaseSessionLease(sessionId: string): Promise<void>;
  acquireProviderSemaphore(providerType: string, maxConcurrent: number, timeoutMs?: number): Promise<(() => void) | null>;
}
