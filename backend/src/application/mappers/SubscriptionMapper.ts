import { Subscription } from '@domain/entities/Subscription';
import { SubscriptionDocument } from '@infrastructure/database/models/organizer/subscription.model';
import { PlanType } from '@domain/enums/PlanType.enum';
import { SubscriptionStatus } from '@domain/enums/SubscriptionStatus.enum';

export class SubscriptionMapper {
  static toDomain(raw: SubscriptionDocument): Subscription {
    return new Subscription({
      id: raw.id,
      collegeId: raw.collegeId,
      planType: raw.planType as PlanType,
      status: raw.status as SubscriptionStatus,
      gatewaySubscriptionId: raw.gatewaySubscriptionId,
      aiTokensAllocated: raw.aiTokensAllocated,
      createdAt: raw.createdAt as Date,
      updatedAt: raw.updatedAt as Date,
    });
  }

  static toPersistence(subscription: Subscription): any {
    return {
      id: subscription.id,
      collegeId: subscription.collegeId,
      planType: subscription.planType,
      status: subscription.status,
      gatewaySubscriptionId: subscription.gatewaySubscriptionId,
      aiTokensAllocated: subscription.aiTokensAllocated,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
