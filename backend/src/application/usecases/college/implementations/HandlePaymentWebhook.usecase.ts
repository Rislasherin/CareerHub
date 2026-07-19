import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IHandlePaymentWebhookUseCase } from "../interfaces/IHandlePaymentWebhook.usecase";
import { IPaymentGateway } from "@domain/repositories/IPaymentGateway";
import { PlanType } from "@domain/enums/PlanType.enum";

export class HandlePaymentWebhookUseCase implements IHandlePaymentWebhookUseCase {
    constructor(
        private readonly subscriptionRepo: ISubscriptionRepository,
        private readonly paymentGateway: IPaymentGateway
    ){}

    async execute(rawBody: string, signature: string, eventType: string, gatewaySubId: string): Promise<void> {

        const isvalid = this.paymentGateway.verifyWebhookSignature(rawBody,signature);

        if(!isvalid) {
            throw new Error("Invalid Webhook Signature");
        }
        if(eventType !== 'subscription.charged') return;

        const subscription = await this.subscriptionRepo.findByGatewayId(gatewaySubId);

        if(!subscription) {
            throw new Error("Subscription not found");
        }

        const tokensToAllocate = subscription.planType === PlanType.PRO ? 1000 : 100;
        subscription.activate(tokensToAllocate);

        await this.subscriptionRepo.save(subscription);
    }
}