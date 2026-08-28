import { IGetSuperAdminRevenueUseCase } from "../interfaces/IGetSuperAdminRevenueUseCase.usecase";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";
import { PlanType } from "@domain/enums/PlanType.enum";

export class GetSuperAdminRevenueUseCase implements IGetSuperAdminRevenueUseCase {
  constructor(
    private readonly subRepo: ISubscriptionRepository,
    private readonly orgRepo: IOrganizationRepository
  ) {}

  async execute(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }): Promise<any> {
    // 1. Fetch paginated subscriptions for transaction history table
    const { subscriptions, total } = await this.subRepo.findAll(page, limit, filters);

    // 2. Fetch all subscriptions to compute aggregate metrics
    const allSubs = await this.subRepo.getAllSubscriptions();
    
    // Filter active subscriptions for financial calculations
    const activeSubs = allSubs.filter(sub => sub.status === SubscriptionStatus.ACTIVE);

    // Compute Total Revenue (YTD)
    const totalRevenue = activeSubs.reduce((sum, sub) => {
      const amount = sub.planType === PlanType.PRO ? 240000 : 99000;
      return sum + amount;
    }, 0);

    // Compute MRR and ARR
    const mrr = Math.round(totalRevenue / 12);
    const arr = totalRevenue;

    // Compute Average Revenue per College
    const uniqueColleges = new Set(activeSubs.map(sub => sub.collegeId));
    const averageRevenuePerCollege = uniqueColleges.size > 0 
      ? Math.round(totalRevenue / uniqueColleges.size) 
      : 0;

    // Aggregate monthly revenue breakdown
    const monthlyMap: { [key: string]: number } = {};
    activeSubs.forEach(sub => {
      const month = sub.createdAt.toLocaleString('default', { month: 'short' });
      const amount = sub.planType === PlanType.PRO ? 240000 : 99000;
      monthlyMap[month] = (monthlyMap[month] || 0) + amount;
    });

    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthlyRevenue = monthNames.map(month => ({
      month,
      revenue: monthlyMap[month] || 0
    }));

    // Aggregate plan breakdown stats
    const proSubs = activeSubs.filter(sub => sub.planType === PlanType.PRO);
    const basicSubs = activeSubs.filter(sub => sub.planType === PlanType.BASIC);
    const planRevenue = [
      {
        planType: "PRO",
        amount: proSubs.reduce((sum, sub) => sum + 240000, 0),
        collegeCount: proSubs.length
      },
      {
        planType: "BASIC",
        amount: basicSubs.reduce((sum, sub) => sum + 99000, 0),
        collegeCount: basicSubs.length
      }
    ];

    // Aggregate top revenue colleges
    const collegeRevenueMap: { [key: string]: number } = {};
    activeSubs.forEach(sub => {
      const amount = sub.planType === PlanType.PRO ? 240000 : 99000;
      collegeRevenueMap[sub.collegeId] = (collegeRevenueMap[sub.collegeId] || 0) + amount;
    });

    const collegeRevenues = await Promise.all(Object.keys(collegeRevenueMap).map(async (collegeId) => {
      const org = await this.orgRepo.findById(collegeId);
      return {
        collegeName: org?.name || 'Unknown College',
        amount: collegeRevenueMap[collegeId]
      };
    }));
    const topColleges = collegeRevenues.sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Map table transactions
    const transactions = await Promise.all(subscriptions.map(async (sub) => {
      const org = await this.orgRepo.findById(sub.collegeId);
      const issueDate = sub.createdAt;
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 10);

      const amount = sub.planType === PlanType.PRO ? 240000 : 99000;

      let status = "PENDING";
      const now = new Date();
      if (sub.status === SubscriptionStatus.ACTIVE) {
        status = "PAID";
      } else if (sub.status === SubscriptionStatus.PENDING) {
        if (now > dueDate) {
          status = "OVERDUE";
        } else {
          status = "PENDING";
        }
      } else if (sub.status === SubscriptionStatus.CANCELLED) {
        status = "CANCELLED";
      }

      return {
        id: sub.id,
        invoiceNumber: `INV-${issueDate.getFullYear()}-${sub.id.substring(0, 6).toUpperCase()}`,
        collegeName: org?.name || 'Unknown College',
        plan: sub.planType,
        amount,
        date: issueDate.toISOString(),
        paymentMethod: sub.status === SubscriptionStatus.ACTIVE ? "Razorpay" : null,
        status
      };
    }));

    return {
      summary: {
        totalRevenue,
        mrr,
        arr,
        averageRevenuePerCollege,
        growthMoM: null,
        growthYoY: null
      },
      monthlyRevenue,
      planRevenue,
      topColleges,
      transactions,
      total
    };
  }
}
