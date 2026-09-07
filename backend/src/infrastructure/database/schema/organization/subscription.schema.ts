import { Schema } from "mongoose";
import { PlanType } from "@domain/enums/PlanType.enum";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

export const SubscriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    collegeId: { type: String, required: true },
    planId: { type: String, required: true },
    planType: { type: String, enum: Object.values(PlanType) },
    status: { 
      type: String, 
      enum: Object.values(SubscriptionStatus), 
      default: SubscriptionStatus.PENDING 
    },
    providerOrderId: { type: String, required: true, unique: true },
    providerPaymentId: { type: String, sparse: true, unique: true },
    aiCreditsAllocated: { type: Number, default: 0 },
    aiCreditsConsumed: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  }
);
