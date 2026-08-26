import mongoose, { Document, Model, Types } from "mongoose";
import { AIInterviewSessionSchema } from "../../schema/company/ai-interview.schema";
import { InterviewPhase } from "@domain/enums/InterviewPhase.enum";
import { QuestionType } from "@domain/enums/QuestionType.enum";

export interface IAnswerEvaluationDocument {
  score: number;
  quality: string;
  feedback: string;
  needsFollowUp: boolean;
}

export interface IInterviewQuestionDocument {
  id: string;
  text: string;
  type: QuestionType;
  context?: string;
  category?: string;
  candidateAnswer?: string;
  evaluation?: IAnswerEvaluationDocument;
}

export interface AIInterviewSessionDocument extends Document {
  interviewId: Types.ObjectId;
  studentId: Types.ObjectId;
  jobId?: Types.ObjectId;
  phase: InterviewPhase;
  questions: IInterviewQuestionDocument[];
  startedAt?: Date;
  completedAt?: Date;
  durationMinutes: number;
  interviewContext?: string;
  configuration?: {
    types?: string[];
    difficulty?: string;
    durationMinutes?: number;
    skills?: string[];
    questionDistribution?: Record<string, number>;
    customInstructions?: string[];
    prohibitedTopics?: string[];
    evaluationCriteria?: string[];
  };
  interviewPlan?: {
    items?: Array<{
      category: string;
      skillOrTopic: string;
      targetQuestions: number;
      questionsAsked: number;
    }>;
  };
  currentTopic?: string;
  coveredTopics?: string[];
  followUpCount?: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const AIInterviewSessionModel: Model<AIInterviewSessionDocument> = 
  mongoose.models.AIInterviewSession || 
  mongoose.model<AIInterviewSessionDocument>('AIInterviewSession', AIInterviewSessionSchema, 'ai_interview_sessions');
