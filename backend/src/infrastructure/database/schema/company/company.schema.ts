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
    website: { type: String, required: false },
    logoUrl: { type: String, required: false },
    industry: { type: String, required: false },
    headquarters: { type: String, required: false },
    description: { type: String, required: false },
    contactJobTitle: { type: String, required: false },
    preferredColleges: [{ type: String }],
    onboardingStep: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      required: true,
    },
    blockedBy: { type: String, required: false },
    rejectionReason: { type: String, required: false },
    rejectedAt: { type: Date, required: false },
    resubmittedAt: { type: Date, required: false },
    approvedAt: { type: Date, required: false },
    verificationDocument: { type: String, required: false },
    verificationDocuments: [
      {
        id: { type: String, required: true },
        category: { type: String, required: true },
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: false },
        mimeType: { type: String, required: false },
        uploadedAt: { type: Date, default: Date.now },
      }
    ],
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, required: false },
        reason: { type: String, required: false }
      }
    ],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  }
);
