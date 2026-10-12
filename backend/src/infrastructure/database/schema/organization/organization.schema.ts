import { Schema } from "mongoose";

export const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: false,
      trim: true,
    },
    studentCountRange: {
      type: String,
      required: false,
    },
    shortName: { type: String, required: false },
    yearEstablished: { type: String, required: false },
    address: { type: String, required: false },
    naacGrade: { type: String, required: false },
    placementCellName: { type: String, required: false },
    placementContactEmail: { type: String, required: false },
    placementContactPhone: { type: String, required: false },
    activeBranches: [{ type: String }],
    currentAcademicYear: { type: String, required: false },
    activePlacementBatch: { type: String, required: false },
    plan: { type: String, required: false },
    trialEndsAt: { type: Date, required: false },
    logoUrl: { type: String, required: false },

    onboardingStep: { type: Number, default: 0 },
    website: { type: String, required: false },
    instituteType: { type: String, required: false },
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
        reason: { type: String, required: false },
        changedBy: { type: String, required: false },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
  },
);
