import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IInvoiceRepository } from "@domain/repositories/IInvoiceRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { IGetBillingInvoicesUseCase } from "../interfaces/IGetBillingInvoices.usecase";

export class GetBillingInvoicesUseCase implements IGetBillingInvoicesUseCase {
  constructor(
    private readonly subRepo: ISubscriptionRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly planRepo: IPlanRepository
  ) {}

  async execute(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }) {
    // 1. Fetch from actual invoices table
    const { data: invoicesData, total } = await this.invoiceRepo.findAll(page, limit, filters);

    // Calculate renewals due from all subscriptions
    const overdueCount = await this.subRepo.countRenewalsDue(30);

    // Get billing stats from repository
    const billingStats = await this.subRepo.getBillingStats();

    const invoices = await Promise.all(invoicesData.map(async (inv) => {
      const org = await this.orgRepo.findById(inv.collegeId);
      const sub = await this.subRepo.findById(inv.subscriptionId);
      const plan = sub ? await this.planRepo.findById(sub.planId) : null;

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        collegeName: org?.name || 'Unknown College',
        plan: plan?.code || 'UNKNOWN',
        amount: inv.total,
        issueDate: inv.issuedAt.toISOString(),
        dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
        status: inv.status.toUpperCase()
      };
    }));

    return {
      invoices,
      total,
      stats: {
        totalRevenue: billingStats.totalCollected,
        activeSubscriptions: overdueCount, // fallback: use overdueCount as proxy
        overdueCount
      }
    };
  }
}
