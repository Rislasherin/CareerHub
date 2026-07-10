import mongoose, { Schema, Document } from "mongoose";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";

export interface IJobApplicationDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  resumeUrl?: string;
  resumeId?: string;
  status: JobApplicationStatus;
  hrNotes?: string;
  currentRoundNumber?: number;
  appliedAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplicationDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    resumeUrl: { type: String },
    resumeId: { type: String },
    status: {
      type: String,
      enum: Object.values(JobApplicationStatus),
      default: JobApplicationStatus.APPLIED,
    },
    hrNotes: { type: String },
    currentRoundNumber: { type: Number, default: 1 },
  },
  { timestamps: { createdAt: "appliedAt", updatedAt: "updatedAt" } }
);

// Ensure a student can't apply to the same job twice
JobApplicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

export const JobApplicationModel = mongoose.model<IJobApplicationDocument>(
  "JobApplication",
  JobApplicationSchema
);
