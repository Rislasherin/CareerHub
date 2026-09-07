import { Schema } from "mongoose";

export const PlanSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    billingInterval: { type: String, enum: ["monthly", "yearly"], default: "yearly" },
    maxStudents: { type: Number, required: true }, // -1 for unlimited
    aiCredits: { type: Number, required: true },
    storageLimit: { type: Number, required: true },
    features: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
  }
);
