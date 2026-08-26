import { IDistributedLockService } from "../../application/interfaces/distributed/IDistributedLockService";
import { DistributedLock } from "./DistributedLock";

export class DistributedLockService implements IDistributedLockService {
  async acquireTurnLock(sessionId: string, ttlMs?: number): Promise<boolean> {
    return DistributedLock.acquireTurnLock(sessionId, ttlMs);
  }

  async releaseTurnLock(sessionId: string): Promise<void> {
    return DistributedLock.releaseTurnLock(sessionId);
  }

  async acquireSessionLease(sessionId: string, ttlMs?: number): Promise<boolean> {
    return DistributedLock.acquireSessionLease(sessionId, ttlMs);
  }

  async renewSessionLease(sessionId: string, ttlMs?: number): Promise<boolean> {
    return DistributedLock.renewSessionLease(sessionId, ttlMs);
  }

  async releaseSessionLease(sessionId: string): Promise<void> {
    return DistributedLock.releaseSessionLease(sessionId);
  }

  async acquireProviderSemaphore(providerType: string, maxConcurrent: number, timeoutMs?: number): Promise<(() => void) | null> {
    return DistributedLock.acquireProviderSemaphore(providerType, maxConcurrent, timeoutMs);
  }
}
