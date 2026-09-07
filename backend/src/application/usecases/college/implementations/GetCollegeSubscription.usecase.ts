import { IGetCollegeSubscriptionUseCase } from "../interfaces/IGetCollegeSubscription.usecase";
import { SubscriptionModel } from "@infrastructure/database/models/organizer/subscription.model";

export class GetCollegeSubscriptionUseCase implements IGetCollegeSubscriptionUseCase {
  async execute(collegeId: string): Promise<any> {
    const sub = await SubscriptionModel.findOne({ collegeId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean() as any;
    if (sub) {
      if (!sub.planType) sub.planType = sub.planId === 'plan_pro' ? 'PRO' : 'BASIC';
      return sub;
    }
    
    // If no active, return the latest pending
    const pending = await SubscriptionModel.findOne({ collegeId }).sort({ createdAt: -1 }).lean() as any;
    if (pending) {
      if (!pending.planType) pending.planType = pending.planId === 'plan_pro' ? 'PRO' : 'BASIC';
      return pending;
    }
    return null;
  }
}
