import { model, Document } from "mongoose";
import { InterviewSchema } from "../../schema/company/interview.schema";

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
  feedback?: Record<string, any>;
  rescheduleRequest?: Record<string, any>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const InterviewModel = model<InterviewDocument>("Interview", InterviewSchema);
