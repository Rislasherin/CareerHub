import { model, Document } from "mongoose";
import { InterviewSchema } from "../../schema/company/interview.schema";
import { RecommendationEnum } from "@domain/enums/Recommendation.enum";
import { InterviewFeedback } from "@domain/entities/Interview";

export interface InterviewDocument extends Document {
  jobId: string;
  applicationId: string;
  studentId: string;
  companyId: string;
  interviewerId: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetingLink?: string;
  feedback?: InterviewFeedback;
  rescheduleRequest?: Record<string, any>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const InterviewModel = model<InterviewDocument>("Interview", InterviewSchema);
