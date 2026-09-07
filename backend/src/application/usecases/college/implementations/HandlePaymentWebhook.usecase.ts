import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IHandlePaymentWebhookUseCase } from "../interfaces/IHandlePaymentWebhook.usecase";
import { IPaymentGateway } from "@domain/repositories/IPaymentGateway";
import { IPaymentRepository } from "@domain/repositories/IPaymentRepository";
import { IInvoiceRepository } from "@domain/repositories/IInvoiceRepository";
import { IPlanRepository } from "@domain/repositories/IPlanRepository";
import { Payment } from "@domain/entities/Payment";
import { Invoice } from "@domain/entities/Invoice";
import { v4 as uuidv4 } from "uuid";

export class HandlePaymentWebhookUseCase implements IHandlePaymentWebhookUseCase {
    constructor(
        private readonly subscriptionRepo: ISubscriptionRepository,
        private readonly paymentGateway: IPaymentGateway,
        private readonly paymentRepo: IPaymentRepository,
        private readonly invoiceRepo: IInvoiceRepository,
        private readonly planRepo: IPlanRepository
    ){}

    async execute(rawBody: string, signature: string, eventType: string, gatewaySubId: string, paymentId?: string, paymentAmount?: number, currency?: string): Promise<void> {

        const isvalid = this.paymentGateway.verifyWebhookSignature(rawBody,signature);

        if(!isvalid) {
            throw new Error("Invalid Webhook Signature");
        }
        
        if (eventType !== 'order.paid' && eventType !== 'payment.captured') return;

        // Ensure we have provider payment ID from Razorpay webhook
        const providerPaymentId = paymentId || `fallback_${Date.now()}_${gatewaySubId}`;
        
        // Idempotency check
        const existingPayment = await this.paymentRepo.findByProviderPaymentId(providerPaymentId);
        if (existingPayment) {
            console.log(`Payment webhook already processed for providerPaymentId: ${providerPaymentId}`);
            return;
        }

        const subscription = await this.subscriptionRepo.findByGatewayId(gatewaySubId);

        if(!subscription) {
            console.log("Subscription not found for this webhook event.");
            return;
        }

        const plan = await this.planRepo.findById(subscription.planId);
        if (!plan) {
            throw new Error("Plan not found");
        }

        const amount = paymentAmount ? paymentAmount / 100 : plan.price; // Convert from paise if needed, or use plan price
        const curr = currency || plan.currency;

        // 1. Create Payment Record
        const payment = new Payment({
            id: uuidv4(),
            collegeId: subscription.collegeId,
            subscriptionId: subscription.id,
            provider: 'razorpay',
            providerPaymentId: providerPaymentId,
            amount: amount,
            currency: curr,
            status: 'successful',
            eventType: eventType,
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
        subscription.activatePayment(providerPaymentId, plan.aiCredits);
        await this.subscriptionRepo.save(subscription);

        // 3. Create Invoice Record
        const issueDate = new Date();
        const invoiceNumber = `INV-${issueDate.getFullYear()}-${subscription.id.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        
        const invoice = new Invoice({
            id: uuidv4(),
            invoiceNumber: invoiceNumber,
            collegeId: subscription.collegeId,
            subscriptionId: subscription.id,
            paymentId: payment.id,
            subtotal: amount,
            tax: 0, // Tax is configurable/0 as requested
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