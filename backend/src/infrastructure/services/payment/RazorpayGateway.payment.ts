import Razorpay from "razorpay";
import crypto, { createHmac } from 'crypto'
import { IPaymentGateway } from "@domain/repositories/IPaymentGateway";
import { CreateSubscriptionDTO } from "@application/dtos/CreateSubscription.dto";

export class RazorpayGateway implements IPaymentGateway {
    private instance: Razorpay;
    private webhookSecret: string;

    constructor(){
        this.instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret:process.env.RAZORPAY_KEY_SECRET!
        })

        this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    }

    async createSubscription(data: CreateSubscriptionDTO): Promise<{ subscriptionId: string; shortUrl: string; }> {
        const response = await this.instance.subscriptions.create({
            plan_id:data.planId,
            customer_notify:1,
            total_count:data.totalCount
        })

        return{
            subscriptionId:response.id,
            shortUrl:response.short_url
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        const expirctedSignature = crypto
        .createHmac('sha256',this.webhookSecret)
        .update(payload)
        .digest('hex');


        return expirctedSignature === signature
    }
}