import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { Subscription } from "@domain/entities/Subscription";
import { SubscriptionModel } from "@infrastructure/database/models/organizer/subscription.model";
import { SubscriptionMapper } from "@application/mappers/SubscriptionMapper";

export class SubscriptionRepository implements ISubscriptionRepository {
  
  async save(subscription: Subscription): Promise<void> {
    const data = SubscriptionMapper.toPersistence(subscription);
    
    // Upsert logic: if it exists, update it. If not, create it.
    await SubscriptionModel.findOneAndUpdate(
      { id: subscription.id },
      { $set: data },
      { upsert: true, new: true }
    );
  }

  async findByGatewayId(gatewayId: string): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({ gatewaySubscriptionId: gatewayId });
    if (!doc) return null;
    return SubscriptionMapper.toDomain(doc);
  }

  async findByCollegeId(collegeId: string): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({ collegeId: collegeId });
    if (!doc) return null;
    return SubscriptionMapper.toDomain(doc);
  }
}
