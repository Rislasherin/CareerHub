import mongoose, { Schema, Document } from 'mongoose';
import { InterviewIntegrityEventType } from '@domain/enums/InterviewIntegrityEventType.enum';

export interface IInterviewIntegrityEventDocument extends Document {
  sessionId: string;
  studentId: string;
  eventType: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const InterviewIntegrityEventSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    eventType: { type: String, enum: Object.values(InterviewIntegrityEventType), required: true },
    timestamp: { type: Date, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const InterviewIntegrityEventModel = mongoose.model<IInterviewIntegrityEventDocument>(
  'InterviewIntegrityEvent',
  InterviewIntegrityEventSchema
);
