import { Payment } from "@domain/entities/Payment";
import { IBaseRepository } from "./IBaseRepository";

export interface IPaymentRepository extends IBaseRepository<Payment> {
  findByProviderPaymentId(providerPaymentId: string): Promise<Payment | null>;
  findByCollegeId(collegeId: string): Promise<Payment[]>;
  findBySubscriptionId(subscriptionId: string): Promise<Payment[]>;
  getRevenueStats(): Promise<{ totalRevenue: number; monthlyRevenue: { month: string; revenue: number }[] }>;
  save(entity: Payment): Promise<void>;
  findAll(page: number, limit: number, filters?: any): Promise<{ data: Payment[]; total: number }>;
}
