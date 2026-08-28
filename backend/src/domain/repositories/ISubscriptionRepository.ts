import { Subscription } from "@domain/entities/Subscription";

export interface ISubscriptionRepository {
    save(subscription: Subscription): Promise<void>;
    findByGatewayId(gatewayId: string): Promise<Subscription | null>;
    findByCollegeId(collegeId: string): Promise<Subscription | null>;
    getPlanDistribution(): Promise<{ planType: string, count: number }[]>;
    countRenewalsDue(days: number): Promise<number>;
    findById(id: string): Promise<Subscription | null>;
    findAll(page: number, limit: number, filters?: { search?: string, status?: string, planType?: string }): Promise<{ subscriptions: Subscription[], total: number }>;
    getBillingStats(): Promise<{ totalCollected: number, outstanding: number, invoicesIssued: number }>;
    getAllSubscriptions(): Promise<Subscription[]>;
}