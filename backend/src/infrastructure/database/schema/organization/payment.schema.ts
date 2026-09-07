import { Schema } from "mongoose";

export const PaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    collegeId: { type: String, required: true },
    subscriptionId: { type: String, required: true },
    provider: { type: String, required: true }, // e.g. 'razorpay'
    providerPaymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, required: true }, // 'successful', 'failed', 'refunded'
    eventType: { type: String, required: true }, // 'subscription.charged'
    failureReason: { type: String },
  },
  {
    timestamps: true,
  }
);
