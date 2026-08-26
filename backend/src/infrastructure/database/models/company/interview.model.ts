import { model, InferSchemaType, models, Types } from 'mongoose';
import { InterviewSchema } from '../../schema/company/interview.schema';

export type InterviewDocument = InferSchemaType<typeof InterviewSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMinutes: number;
  isDeleted: boolean;
};

export const InterviewModel = models.Interview || model("Interview", InterviewSchema);
