import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionDocument } from '@infrastructure/database/models/organizer/subscription.model';
import { SubscriptionStatus } from '@domain/enums/SubscriptionStatus.enum';

export class SubscriptionMapper {
  static toDomain(raw: SubscriptionDocument): Subscription {
    return new Subscription({
      id: raw.id,
      collegeId: raw.collegeId,
      planId: raw.planId || (raw as any).get?.('planId') || (raw as any).planId,
      planType: (raw as any).planType || (raw as any).get?.('planType'),
      status: raw.status as SubscriptionStatus,
      providerOrderId: raw.providerOrderId,
      providerPaymentId: (raw as any).providerPaymentId,
      aiCreditsAllocated: (raw as any).aiCreditsAllocated || 0,
      aiCreditsConsumed: (raw as any).aiCreditsConsumed || 0,
      startDate: (raw as any).startDate,
      endDate: (raw as any).endDate,
      createdAt: raw.createdAt as Date,
      updatedAt: raw.updatedAt as Date,
    });
  }

  static toPersistence(subscription: Subscription): Partial<SubscriptionDocument> {
    return {
      id: subscription.id,
      collegeId: subscription.collegeId,
      planId: subscription.planId,
      planType: subscription.planType,
      status: subscription.status,
      providerOrderId: subscription.providerOrderId,
      providerPaymentId: subscription.providerPaymentId,
      aiCreditsAllocated: subscription.aiCreditsAllocated,
      aiCreditsConsumed: subscription.aiCreditsConsumed,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    } as any;
  }
}
