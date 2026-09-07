import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { ICreateSubscriptionUseCase } from "../interfaces/ICreateSubscription.usecase";
import { IPaymentGateway } from "@domain/repositories/IPaymentGateway";
import { PlanType } from "@domain/enums/PlanType.enum";
import { Subscription } from "@domain/entities/Subscription";
import { v4 as uuidv4 } from "uuid";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

export class CreateSubscriptionUseCase implements ICreateSubscriptionUseCase {
    constructor(
        private readonly subscriptionRepo: ISubscriptionRepository,
        private readonly paymentGateway: IPaymentGateway
    ) { }

    async execute(collegeId: string, planType: PlanType): Promise<{ gatewayOrderId: string; }> {
        // Use test mode price of ₹1000 for Pro plan
        const amount = planType === PlanType.PRO ? 100000 : 9900000;
        const currency = "INR";
        const receipt = `receipt_${uuidv4().substring(0, 8)}`;

        const gatewayResponse = await this.paymentGateway.createOrder(amount, currency, receipt);

        const internalPlanId = planType === PlanType.PRO ? 'plan_pro' : 'plan_basic';

        const subscription = new Subscription({
            id: uuidv4(),
            collegeId: collegeId,
            planId: internalPlanId,
            planType: planType,
            status: SubscriptionStatus.PENDING,
            providerOrderId: gatewayResponse.orderId,
            aiCreditsAllocated: 0,
            aiCreditsConsumed: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await this.subscriptionRepo.save(subscription);
        return {
            gatewayOrderId: gatewayResponse.orderId
        }
    }
}