import { Schema } from 'mongoose';
import { InterviewStatus } from '@domain/enums/InterviewStatus.enum';
import { InterviewType } from '@domain/enums/InterviewType.enum';

export const InterviewSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.SCHEDULED,
      required: true,
    },

    // Set when the interview begins
    startedAt: {
      type: Date,
      default: null,
    },

    // Set when the report is saved and interview is COMPLETED
    completedAt: {
      type: Date,
      default: null,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    durationMinutes: {
      type: Number,
      required: true,
    },

    configuration: {
      types: [{ type: String, enum: Object.values(InterviewType) }],
      difficulty: { type: String, default: 'MID' },
      durationMinutes: { type: Number },
      totalQuestions: { type: Number },
      skills: [{ type: String }],
      questionDistribution: { type: Schema.Types.Mixed },
      customInstructions: [{ type: String }],
      prohibitedTopics: [{ type: String }],
      evaluationCriteria: [{ type: String }],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
