import { CreateSubscriptionDTO } from "../../application/dtos/CreateSubscription.dto";

export interface IPaymentGateway {
    createSubscription(data: CreateSubscriptionDTO): Promise<{ subscriptionId: string; shortUrl: string }>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
}