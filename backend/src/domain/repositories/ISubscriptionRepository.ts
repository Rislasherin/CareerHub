import { Subscription } from "@domain/entities/Subscription";

export interface ISubscriptionRepository {
    save(subscription: Subscription): Promise<void>;
    findByGatewayId(gatewayId: string): Promise<Subscription | null>;
    findByCollegeId(collegeId: string): Promise<Subscription | null>;
}