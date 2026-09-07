import { Invoice } from "@domain/entities/Invoice";
import { IBaseRepository } from "./IBaseRepository";

export interface IInvoiceRepository extends IBaseRepository<Invoice> {
  findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
  findByCollegeId(collegeId: string): Promise<Invoice[]>;
  findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
  save(entity: Invoice): Promise<void>;
  findAll(page: number, limit: number, filters?: any): Promise<{ data: Invoice[]; total: number }>;
}
