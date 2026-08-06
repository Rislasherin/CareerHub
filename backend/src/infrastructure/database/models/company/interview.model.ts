import { model, Document } from 'mongoose';
import { InterviewSchema } from '../../schema/company/interview.schema';
import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewType } from '@domain/enums/InterviewType.enum';

export interface InterviewDocument extends Document {
  studentId: string;
  jobId: string;
  companyId: string;
  type: InterviewType;
  status: InterviewStatus;
  liveKitRoomName: string | null;
  scheduledAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const InterviewModel = model<InterviewDocument>('Interview', InterviewSchema);
