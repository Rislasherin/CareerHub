import { IGetCollegeSubscriptionUseCase } from "../interfaces/IGetCollegeSubscription.usecase";
import { SubscriptionModel } from "@infrastructure/database/models/organizer/subscription.model";

export class GetCollegeSubscriptionUseCase implements IGetCollegeSubscriptionUseCase {
  async execute(collegeId: string): Promise<any> {
    const sub = await SubscriptionModel.findOne({ collegeId, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean();
    if (sub) return sub;
    
    // If no active, return the latest pending
    const pending = await SubscriptionModel.findOne({ collegeId }).sort({ createdAt: -1 }).lean();
    return pending || null;
  }
}
