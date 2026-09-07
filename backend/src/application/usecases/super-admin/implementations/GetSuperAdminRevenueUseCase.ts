import { IGetSuperAdminRevenueUseCase } from "../interfaces/IGetSuperAdminRevenueUseCase.usecase";
import { IPaymentRepository } from "@domain/repositories/IPaymentRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { Payment } from "@domain/entities/Payment";

export class GetSuperAdminRevenueUseCase implements IGetSuperAdminRevenueUseCase {
  constructor(
    private readonly paymentRepo: IPaymentRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly subRepo: ISubscriptionRepository
  ) {}

  async execute(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }): Promise<any> {
    // Fetch all payments for stats, large page size to get all
    const { data: payments } = await this.paymentRepo.findAll(1, 10000, filters);
    const { totalRevenue, monthlyRevenue } = await this.paymentRepo.getRevenueStats();

    // Compute MRR and ARR
    const mrr = Math.round(totalRevenue / 12);
    const arr = totalRevenue;

    const successfulPayments = payments.filter((p: Payment) => p.status === 'successful');

    // Compute Average Revenue per College
    const uniqueColleges = new Set(successfulPayments.map((p: Payment) => p.collegeId));
    const averageRevenuePerCollege = uniqueColleges.size > 0 
      ? Math.round(totalRevenue / uniqueColleges.size) 
      : 0;

    // Aggregate plan breakdown stats
    let proAmount = 0;
    let basicAmount = 0;
    let proCount = 0;
    let basicCount = 0;

    // Aggregate top revenue colleges
    const collegeRevenueMap: { [key: string]: number } = {};

    for (const payment of successfulPayments) {
      collegeRevenueMap[payment.collegeId] = (collegeRevenueMap[payment.collegeId] || 0) + payment.amount;
      
      const sub = await this.subRepo.findById(payment.subscriptionId);
      if (sub) {
        if (sub.planId === 'pro-plan') {
          proAmount += payment.amount;
          proCount++;
        } else if (sub.planId === 'basic-plan') {
          basicAmount += payment.amount;
          basicCount++;
        }
      }
    }

    const planRevenue = [
      { planType: "PRO", amount: proAmount, collegeCount: proCount },
      { planType: "BASIC", amount: basicAmount, collegeCount: basicCount }
    ];

    const collegeRevenues = await Promise.all(Object.keys(collegeRevenueMap).map(async (collegeId) => {
      const org = await this.orgRepo.findById(collegeId);
      return { collegeName: org?.name || 'Unknown College', amount: collegeRevenueMap[collegeId] };
    }));
    const topColleges = collegeRevenues.sort((a, b) => b.amount - a.amount).slice(0, 5);

    // Map table transactions
    const paginatedPayments = payments.slice((page - 1) * limit, page * limit);
    const transactions = await Promise.all(paginatedPayments.map(async (payment: Payment) => {
      const org = await this.orgRepo.findById(payment.collegeId);
      const sub = await this.subRepo.findById(payment.subscriptionId);

      return {
        id: payment.id,
        invoiceNumber: `INV-${payment.createdAt.getFullYear()}-${payment.id?.substring(0, 6).toUpperCase()}`,
        collegeName: org?.name || 'Unknown College',
        plan: sub?.planId === 'pro-plan' ? 'PRO' : (sub?.planId === 'basic-plan' ? 'BASIC' : 'UNKNOWN'),
        amount: payment.amount,
        date: payment.createdAt.toISOString(),
        paymentMethod: payment.provider,
        status: payment.status === 'successful' ? 'PAID' : (payment.status === 'failed' ? 'FAILED' : 'PENDING')
      };
    }));

    return {
      summary: { totalRevenue, mrr, arr, averageRevenuePerCollege, growthMoM: null, growthYoY: null },
      monthlyRevenue,
      planRevenue,
      topColleges,
      transactions,
      total: payments.length
    };
  }
}
