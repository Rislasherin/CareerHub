import { Schema } from "mongoose";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { QuestionType } from "@domain/enums/QuestionType.enum";
import { AnswerQuality } from "@domain/enums/AnswerQuality.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";

const AnswerEvaluationSchema = new Schema({
  score: { type: Number, required: true },
  quality: { type: String, enum: Object.values(AnswerQuality), required: true },
  feedback: { type: String, required: true },
  needsFollowUp: { type: Boolean, required: true }
}, { _id: false });

const InterviewQuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: Object.values(QuestionType), required: true },
  context: { type: String },
  category: { type: String, enum: Object.values(InterviewType) },
  candidateAnswer: { type: String },
  evaluation: { type: AnswerEvaluationSchema }
}, { _id: false });

const InterviewPlanItemSchema = new Schema({
  category: { type: String, enum: Object.values(InterviewType), required: true },
  skillOrTopic: { type: String, required: true },
  targetQuestions: { type: Number, required: true },
  questionsAsked: { type: Number, default: 0 }
}, { _id: false });

export const AIInterviewSessionSchema = new Schema({
  interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job' },
  phase: { type: String, enum: Object.values(InterviewPhase), default: InterviewPhase.NOT_STARTED, required: true },
  questions: { type: [InterviewQuestionSchema], default: [] },
  startedAt: { type: Date },
  completedAt: { type: Date },
  durationMinutes: { type: Number, required: true },
  interviewContext: { type: String },
  configuration: {
    types: [{ type: String, enum: Object.values(InterviewType) }],
    difficulty: { type: String },
    durationMinutes: { type: Number },
    skills: [{ type: String }],
    questionDistribution: { type: Schema.Types.Mixed },
    customInstructions: [{ type: String }],
    prohibitedTopics: [{ type: String }],
    evaluationCriteria: [{ type: String }],
  },
  interviewPlan: {
    items: { type: [InterviewPlanItemSchema], default: [] }
  },
  currentTopic: { type: String },
  coveredTopics: [{ type: String }],
  followUpCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false }
}, {
  timestamps: true
});
