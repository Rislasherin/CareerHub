import { Schema } from "mongoose";

export const CompanySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sector: {
      type: String,
      required: false,
      trim: true,
    },
    size: {
      type: String,
      required: false,
    },
    location: {
      type: String,
      required: false,
    },
    contactName: {
      type: String,
      required: false,
    },
    contactEmail: {
      type: String,
      required: false,
    },
    contactPhone: {
      type: String,
      required: false,
    },
    onboardingStep: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"],
      default: "PENDING",
    },
    blockedBy: { type: String, required: false },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);
