import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IVerifyPaymentUseCase } from "../interfaces/IVerifyPayment.usecase";
import { IPaymentGateway } from "@domain/repositories/IPaymentGateway";
import { IPaymentRepository } from "@domain/repositories/IPaymentRepository";
import { IInvoiceRepository } from "@domain/repositories/IInvoiceRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { Payment } from "@domain/entities/Payment";
import { Invoice } from "@domain/entities/Invoice";
import { v4 as uuidv4 } from "uuid";

export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
    constructor(
        private readonly subscriptionRepo: ISubscriptionRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly paymentRepo: IPaymentRepository,
        private readonly invoiceRepo: IInvoiceRepository,
        private readonly planRepo: IPlanRepository
    ){}

    async execute(orderId: string, paymentId: string, signature: string): Promise<void> {
        const isValid = this.paymentGateway.verifyPaymentSignature(orderId, paymentId, signature);

        if (!isValid) {
            throw new Error("Invalid Payment Signature");
        }
        
        // Idempotency check
        const existingPayment = await this.paymentRepo.findByProviderPaymentId(paymentId);
        if (existingPayment) {
            console.log(`Payment already processed for providerPaymentId: ${paymentId}`);
            return;
        }

        const subscription = await this.subscriptionRepo.findByGatewayId(orderId);

        if (!subscription) {
            throw new Error("Subscription not found for this order");
        }

        const plan = await this.planRepo.findById(subscription.planId);
        if (!plan) {
            throw new Error("Plan not found");
        }

        // We use the amount configured for the plan.
        const amount = plan.price;
        const curr = plan.currency;

        // 1. Create Payment Record
        const payment = new Payment({
            id: uuidv4(),
            collegeId: subscription.collegeId,
            subscriptionId: subscription.id,
            provider: 'razorpay',
            providerPaymentId: paymentId,
            amount: amount,
            currency: curr,
            status: 'successful',
            eventType: 'order.paid',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await this.paymentRepo.save(payment);

        // 2. Transition old subscription if it exists
        const oldSubscription = await this.subscriptionRepo.findByCollegeId(subscription.collegeId);
        if (oldSubscription && oldSubscription.id !== subscription.id && oldSubscription.status === 'ACTIVE') {
            oldSubscription.cancel();
            await this.subscriptionRepo.save(oldSubscription);
        }

        // 3. Activate Subscription
        subscription.activatePayment(paymentId, plan.aiCredits);
        await this.subscriptionRepo.save(subscription);

        // 4. Create Invoice Record
        const issueDate = new Date();
        const invoiceNumber = `INV-${issueDate.getFullYear()}-${subscription.id.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        
        const invoice = new Invoice({
            id: uuidv4(),
            invoiceNumber: invoiceNumber,
            collegeId: subscription.collegeId,
            subscriptionId: subscription.id,
            paymentId: payment.id,
            subtotal: amount,
            tax: 0,
            total: amount,
            currency: curr,
            status: 'paid',
            issuedAt: issueDate,
            createdAt: issueDate,
            updatedAt: issueDate
        });
        await this.invoiceRepo.save(invoice);
    }
}
