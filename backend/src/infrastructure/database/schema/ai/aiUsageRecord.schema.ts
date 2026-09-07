  import { Schema } from "mongoose";

export const AIUsageRecordSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    subscriptionId: { type: String },
    collegeId: { type: String, required: true },
    userId: { type: String, required: true },
    feature: { type: String, required: true }, // e.g. 'mock_interview', 'resume_builder'
    creditsConsumed: { type: Number, required: true },
    reservedCredits: { type: Number },
    status: { type: String, enum: ['RESERVED', 'COMMITTED', 'RELEASED'], default: 'COMMITTED' },
    provider: { type: String, required: true }, // e.g. 'openai', 'livekit'
    model: { type: String },
    tokens: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    committedAt: { type: Date },
    releasedAt: { type: Date },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);
