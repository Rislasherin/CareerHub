import { Schema } from "mongoose";
import { PlanType } from "@domain/enums/PlanType.enum";
import { SubscriptionStatus } from "@domain/enums/SubscriptionStatus.enum";

export const SubscriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    collegeId: { type: String, required: true },
    planType: { type: String, enum: Object.values(PlanType), required: true },
    status: { 
      type: String, 
      enum: Object.values(SubscriptionStatus), 
      default: SubscriptionStatus.PENDING 
    },
    gatewaySubscriptionId: { type: String, required: true, unique: true },
    aiTokensAllocated: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);
