import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { SubscriptionModel } from "@infrastructure/database/models/organizer/subscription.model";
import { OrganizationModel } from "@infrastructure/database/models/organizer/organization.model";

export class GetBillingInvoicesUseCase {
  constructor(
    private readonly subRepo: ISubscriptionRepository,
    private readonly orgRepo: IOrganizationRepository
  ) {}

  async execute(page: number, limit: number) {
    
    const skip = (page - 1) * limit;

    const subscriptions = await SubscriptionModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SubscriptionModel.countDocuments();

    // Calculate YTD and Outstanding stats
    const allSubs = await SubscriptionModel.find({}).lean();
    let totalCollected = 0;
    let outstanding = 0;
    let overdueCount = 0;

    const invoices = await Promise.all(subscriptions.map(async (sub: any, index: number) => {
      const org = await OrganizationModel.findById(sub.collegeId).lean();
      
      const issueDate = new Date(sub.createdAt);
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 10); // 10 day payment window
      
      const amount = sub.planType === 'PRO' ? 240000 : 99000;
      let status = 'PAID';
      
      if (sub.status === 'PENDING') {
        if (new Date() > dueDate) {
          status = 'OVERDUE';
        } else {
          status = 'PENDING';
        }
      }

      return {
        id: sub._id.toString(),
        invoiceNumber: `INV-${issueDate.getFullYear()}-${(skip + index + 1).toString().padStart(3, '0')}`,
        collegeName: (org as any)?.name || 'Unknown College',
        plan: sub.planType,
        amount,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status
      };
    }));
    
    // Add real stats from all subs
    allSubs.forEach((sub: any) => {
        const issueDate = new Date(sub.createdAt);
        const dueDate = new Date(issueDate);
        dueDate.setDate(dueDate.getDate() + 10);

        const amount = sub.planType === 'PRO' ? 240000 : 99000;
        
        if (sub.status === 'PENDING') {
            outstanding += amount;
            if (new Date() > dueDate) {
                overdueCount++;
            }
        } else if (sub.status === 'ACTIVE') {
            totalCollected += amount;
        }
    });

    return {
      invoices,
      total,
      stats: {
        totalCollected,
        outstanding,
        overdueCount,
        invoicesIssued: total
      }
    };
  }
}
