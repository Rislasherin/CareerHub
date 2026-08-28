import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { Subscription } from "@domain/entities/Subscription";
import { SubscriptionModel } from "@infrastructure/database/models/organizer/subscription.model";
import { SubscriptionMapper } from "@application/mappers/SubscriptionMapper";
import { OrganizationModel } from "@infrastructure/database/models/organizer/organization.model";

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

  async getPlanDistribution(): Promise<{ planType: string, count: number }[]> {
    const result = await SubscriptionModel.aggregate([
      { $group: { _id: "$planType", count: { $sum: 1 } } }
    ]);
    return result.map((r: any) => ({ planType: r._id, count: r.count }));
  }

  async countRenewalsDue(days: number): Promise<number> {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + days);
    return SubscriptionModel.countDocuments({
      endDate: { $gte: now, $lte: targetDate },
      status: "ACTIVE"
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({ id });
    if (!doc) return null;
    return SubscriptionMapper.toDomain(doc);
  }

  async findAll(
    page: number, 
    limit: number, 
    filters?: { search?: string, status?: string, planType?: string }
  ): Promise<{ subscriptions: Subscription[], total: number }> {
    const query: any = {};

    if (filters?.planType) {
      query.planType = filters.planType;
    }

    if (filters?.search) {
      const orgs = await OrganizationModel.find({ name: { $regex: filters.search, $options: 'i' } });
      const collegeIds = orgs.map(o => o._id.toString());
      query.collegeId = { $in: collegeIds };
    }

    if (filters?.status) {
      if (filters.status === 'PAID') {
        query.status = 'ACTIVE';
      } else if (filters.status === 'PENDING') {
        const now = new Date();
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(now.getDate() - 10);
        query.status = 'PENDING';
        query.createdAt = { $gte: tenDaysAgo };
      } else if (filters.status === 'OVERDUE') {
        const now = new Date();
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(now.getDate() - 10);
        query.status = 'PENDING';
        query.createdAt = { $lt: tenDaysAgo };
      } else if (filters.status === 'CANCELLED') {
        query.status = 'CANCELLED';
      }
    }

    const skip = (page - 1) * limit;
    const docs = await SubscriptionModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await SubscriptionModel.countDocuments(query);
    const subscriptions = docs.map(doc => SubscriptionMapper.toDomain(doc));
    return { subscriptions, total };
  }

  async getBillingStats(): Promise<{ totalCollected: number, outstanding: number, invoicesIssued: number }> {
    const docs = await SubscriptionModel.find({});
    let totalCollected = 0;
    let outstanding = 0;

    for (const doc of docs) {
      const amount = doc.planType === 'PRO' ? 240000 : 99000;
      if (doc.status === 'ACTIVE') {
        totalCollected += amount;
      } else if (doc.status === 'PENDING') {
        outstanding += amount;
      }
    }

    return {
      totalCollected,
      outstanding,
      invoicesIssued: docs.length
    };
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    const docs = await SubscriptionModel.find({});
    return docs.map(doc => SubscriptionMapper.toDomain(doc));
  }
}
