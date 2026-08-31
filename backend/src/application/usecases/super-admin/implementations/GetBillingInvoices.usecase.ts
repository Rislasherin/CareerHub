import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";
import { IGetBillingInvoicesUseCase } from "../interfaces/IGetBillingInvoices.usecase";

export class GetBillingInvoicesUseCase implements IGetBillingInvoicesUseCase {
  constructor(
    private readonly subRepo: ISubscriptionRepository,
    private readonly orgRepo: IOrganizationRepository
  ) {}

  async execute(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }) {
    const { subscriptions, total } = await this.subRepo.findAll(page, limit, filters);

    // Calculate renewals due from all subscriptions
    const overdueCount = await this.subRepo.countRenewalsDue(30);

    // Get billing stats from repository
    const billingStats = await this.subRepo.getBillingStats();

    const invoices = await Promise.all(subscriptions.map(async (sub) => {
      const org = await this.orgRepo.findById(sub.collegeId);
      
      const issueDate = sub.createdAt;
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + 10);

      const amount = sub.planType === 'PRO' ? 240000 : 99000;
      const invoiceNumber = `INV-${issueDate.getFullYear()}-${sub.id.substring(0, 6).toUpperCase()}`;

      // Determine the business status authoritatively
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
        invoiceNumber,
        collegeName: org?.name || 'Unknown College',
        plan: sub.planType,
        amount,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        status
      };
    }));

    return {
      invoices,
      total,
      stats: {
        totalCollected: billingStats.totalCollected,
        outstanding: billingStats.outstanding,
        overdueCount,
        invoicesIssued: billingStats.invoicesIssued
      }
    };
  }
}
