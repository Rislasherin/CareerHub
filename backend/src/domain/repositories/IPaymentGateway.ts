import { CreateSubscriptionDTO } from "../../application/dtos/CreateSubscription.dto";

export interface IPaymentGateway {
    createSubscription(data: CreateSubscriptionDTO): Promise<{ subscriptionId: string; shortUrl: string }>;
    createOrder(amount: number, currency: string, receipt: string): Promise<{ orderId: string }>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
}