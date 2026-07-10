import { Schema } from "mongoose";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { RecommendationEnum } from "@domain/enums/Recommendation.enum";

export const InterviewFeedbackSchema = new Schema({
  dsaScore: { type: Number, min: 1, max: 5 },
  dsaNotes: { type: String },
  codingScore: { type: Number, min: 1, max: 5 },
  codingNotes: { type: String },
  systemDesignScore: { type: Number, min: 1, max: 5 },
  systemDesignNotes: { type: String },
  problemSolvingScore: { type: Number, min: 1, max: 5 },
  problemSolvingNotes: { type: String },
  strengths: { type: String },
  weaknesses: { type: String },
  hrNotes: { type: String },
  recommendedAction: { type: String, enum: Object.values(RecommendationEnum) }
}, { _id: false });

export const RescheduleRequestSchema = new Schema({
  reason: { type: String, required: true },
  preferredDate: { type: Date, required: true },
  preferredTime: { type: String, required: true },
  noteToHr: { type: String },
  requestedAt: { type: Date, default: Date.now }
}, { _id: false });

export const InterviewSchema = new Schema({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicationId: { type: Schema.Types.ObjectId, ref: 'JobApplication', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  interviewerId: { type: Schema.Types.ObjectId, ref: 'Interviewer', required: true },
  
  title: { type: String, required: true },
  type: { type: String, enum: Object.values(InterviewType), required: true },
  roundNumber: { type: Number, required: true },
  status: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.SCHEDULED },
  
  scheduledAt: { type: Date, required: true },
  durationMinutes: { type: Number, required: true, default: 60 },
  meetingLink: { type: String },
  
  feedback: { type: InterviewFeedbackSchema, default: null },
  rescheduleRequest: { type: RescheduleRequestSchema, default: null },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
