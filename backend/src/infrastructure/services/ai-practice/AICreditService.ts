import { IAICreditService } from "@domain/services/IAICreditService";
import { IAIUsageRepository } from "@domain/repositories/IAIUsageRepository";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { DistributedLock } from "@infrastructure/distributed/DistributedLock";
import { AIUsageRecord } from "@domain/entities/AIUsageRecord";
import { v4 as uuidv4 } from "uuid";

export class AICreditService implements IAICreditService {
  constructor(
    private readonly aiUsageRepo: IAIUsageRepository,
    private readonly subscriptionRepo: ISubscriptionRepository,
  ) {}

  async checkQuota(collegeId: string, requiredCredits: number): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription || subscription.status !== 'ACTIVE') return false;

    const remaining = subscription.aiCreditsAllocated - subscription.aiCreditsConsumed;
    return remaining >= requiredCredits;
  }

  async consumeCredits(
    collegeId: string, 
    userId: string, 
    feature: string, 
    requiredCredits: number, 
    provider: string, 
    model?: string, 
    tokens?: number
  ): Promise<void> {
    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new Error("No active subscription found for college.");
    }

    // Atomic consumption guarantees no quota overspend even concurrently
    const success = await this.subscriptionRepo.atomicConsumeCredits(subscription.id, requiredCredits);
    if (!success) {
      throw new Error(`Insufficient AI Credits or Subscription is not active.`);
    }

    const usageRecord = new AIUsageRecord({
      id: uuidv4(),
      subscriptionId: subscription.id,
      collegeId,
      userId,
      feature,
      creditsConsumed: requiredCredits,
      provider,
      model,
      tokens,
      status: 'COMMITTED',
      committedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await this.aiUsageRepo.save(usageRecord);
  }

  async reserveCredits(
    collegeId: string, 
    userId: string, 
    feature: string, 
    requiredCredits: number, 
    provider: string
  ): Promise<string> {
    const subscription = await this.subscriptionRepo.findByCollegeId(collegeId);
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new Error("No active subscription found for college.");
    }

    // Atomically reserve the credits so they are immediately deducted from the balance
    const success = await this.subscriptionRepo.atomicConsumeCredits(subscription.id, requiredCredits);
    if (!success) {
      throw new Error(`Insufficient AI Credits or Subscription is not active.`);
    }

    const reservationId = uuidv4();
    
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour TTL for a reservation

    const usageRecord = new AIUsageRecord({
      id: reservationId,
      subscriptionId: subscription.id,
      collegeId,
      userId,
      feature,
      reservedCredits: requiredCredits,
      creditsConsumed: 0,
      provider,
      status: 'RESERVED',
      expiresAt: expiry,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await this.aiUsageRepo.save(usageRecord);

    return reservationId;
  }

  async commitCredits(
    reservationId: string, 
    finalCredits: number, 
    telemetry?: any
  ): Promise<void> {
    const lockKey = `ai_quota_commit_lock:${reservationId}`;
    const acquired = await DistributedLock.acquireLock(lockKey, 5000);

    if (!acquired) {
      throw new Error("Could not acquire quota lock for commit, system busy.");
    }

    try {
      const record = await this.aiUsageRepo.findById(reservationId);
      if (!record) {
        throw new Error("Reservation not found.");
      }

      if (record.status !== 'RESERVED') {
        // Idempotency: If already committed or released, do nothing safely
        console.log(`Reservation ${reservationId} is already in status ${record.status}. Ignoring commit.`);
        return;
      }

      const reserved = record.reservedCredits || 0;
      
      // Calculate adjustment. 
      // If finalCredits < reserved, we refund the difference.
      // If finalCredits > reserved, we attempt to deduct the extra.
      const difference = finalCredits - reserved;
      
      if (difference > 0 && record.subscriptionId) {
        const success = await this.subscriptionRepo.atomicConsumeCredits(record.subscriptionId, difference);
        if (!success) {
          // If college is completely out of credits, cap at reserved.
          console.warn(`Could not deduct ${difference} overage credits for ${reservationId}. Capping at reserved.`);
          finalCredits = reserved;
        }
      } else if (difference < 0 && record.subscriptionId) {
        // Refund unused reserved credits
        await this.subscriptionRepo.atomicReleaseCredits(record.subscriptionId, Math.abs(difference));
      }

      record.commit(finalCredits, telemetry);
      await this.aiUsageRepo.save(record);

    } finally {
      await DistributedLock.releaseLock(lockKey);
    }
  }

  async releaseCredits(reservationId: string): Promise<void> {
    const lockKey = `ai_quota_commit_lock:${reservationId}`;
    const acquired = await DistributedLock.acquireLock(lockKey, 5000);

    if (!acquired) {
      throw new Error("Could not acquire quota lock for release, system busy.");
    }

    try {
      const record = await this.aiUsageRepo.findById(reservationId);
      if (!record) {
        throw new Error("Reservation not found.");
      }

      if (record.status !== 'RESERVED') {
        console.log(`Reservation ${reservationId} is already in status ${record.status}. Ignoring release.`);
        return;
      }

      const reserved = record.reservedCredits || 0;
      if (reserved > 0 && record.subscriptionId) {
        // Refund all reserved credits
        await this.subscriptionRepo.atomicReleaseCredits(record.subscriptionId, reserved);
      }

      record.release();
      await this.aiUsageRepo.save(record);

    } finally {
      await DistributedLock.releaseLock(lockKey);
    }
  }
}
