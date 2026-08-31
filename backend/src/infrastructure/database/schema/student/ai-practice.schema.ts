import { Schema } from "mongoose";
import { PracticeDifficulty } from "@domain/enums/PracticeDifficulty.enum";
import { PracticeInterviewStatus } from "@domain/enums/PracticeInterviewStatus.enum";

const AIPracticeQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    topic: { type: String, required: true },
    candidateAnswer: { type: String },
    score: { type: Number },
    feedback: { type: String },
    createdAt: { type: Date, required: true },
    answeredAt: { type: Date },
  },
  { _id: false }
);

export const AIPracticeInterviewSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    difficulty: { type: String, enum: Object.values(PracticeDifficulty), required: true },
    topics: { type: [String], required: true },
    status: {
      type: String,
      enum: Object.values(PracticeInterviewStatus),
      required: true,
      index: true,
    },
    questions: { type: [AIPracticeQuestionSchema], default: [] },
    durationMinutes: { type: Number },
    startedAt: { type: Date },
    completedAt: { type: Date },
    finalFeedback: { type: Object },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
