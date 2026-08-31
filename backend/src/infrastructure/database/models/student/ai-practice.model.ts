import mongoose, { InferSchemaType, Model, model, models } from "mongoose";
import { AIPracticeInterviewSchema } from "../../schema/student/ai-practice.schema";

export type AIPracticeInterviewDocument = InferSchemaType<typeof AIPracticeInterviewSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };

export const AIPracticeInterviewModel: Model<AIPracticeInterviewDocument> = 
  models.AIPracticeInterview || 
  model<AIPracticeInterviewDocument>('AIPracticeInterview', AIPracticeInterviewSchema, 'ai_practice_interviews');
