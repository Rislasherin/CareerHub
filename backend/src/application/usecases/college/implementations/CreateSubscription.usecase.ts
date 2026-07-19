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

    async execute(collegeId: string, planType: PlanType): Promise<{ gatewaySubscriptionId: string; }> {
        const planId = planType === PlanType.PRO
            ? process.env.RAZORPAY_PRO_PLAN_ID! 
            : process.env.RAZORPAY_BASIC_PLAN_ID!;

        const gatewayResponse = await this.paymentGateway.createSubscription({
                    planId: planId,
                    totalCount: 12
                });

        const subscription = new Subscription({
            id: uuidv4(),
            collegeId: collegeId,
            planType: planType,
            status: SubscriptionStatus.PENDING,
            gatewaySubscriptionId: gatewayResponse.subscriptionId,
            aiTokensAllocated: 0, // Tokens allocated only upon successful payment (webhook)
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await this.subscriptionRepo.save(subscription);
        return {
            gatewaySubscriptionId: gatewayResponse.subscriptionId
        }
    }
}