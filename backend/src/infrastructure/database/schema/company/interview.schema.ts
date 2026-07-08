import { Schema } from "mongoose";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";

export const InterviewFeedbackSchema = new Schema({
  technicalScore: { type: Number, min: 0, max: 10 },
  communicationScore: { type: Number, min: 0, max: 10 },
  problemSolvingScore: { type: Number, min: 0, max: 10 },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  finalRemarks: { type: String },
  recommendedAction: { type: String, enum: ['HIRE', 'REJECT', 'STRONG_HIRE', 'HOLD'] }
}, { _id: false });

export const InterviewSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'JobApplication', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: 'Interviewer', required: true },
  
  title: { type: String, required: true },
  type: { type: String, enum: Object.values(InterviewType), required: true },
  status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.SCHEDULED },
  
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  meetingLink: { type: String },
  
  feedback: { type: InterviewFeedbackSchema, default: null },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
