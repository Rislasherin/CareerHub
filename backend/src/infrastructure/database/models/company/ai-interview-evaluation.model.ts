import mongoose, { Document } from 'mongoose';
import { AIInterviewEvaluationSchema } from '../../schema/company/ai-interview-evaluation.schema';

export interface IAIInterviewEvaluationDocument extends Document {
  interviewId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  overallScore: number | null;
  overallSummary: string;
  competencies: Array<{
    name: string;
    category: string;
    score: number | null;
    status: 'EVALUATED' | 'INSUFFICIENT_EVIDENCE';
    explanation: string;
    evidence: string[];
  }>;
  strengths: string[];
  developmentAreas: string[];
  questionAnalyses: Array<{
    questionId: string;
    questionText: string;
    candidateAnswer: string;
    score: number;
    feedback: string;
    evidence: string[];
    competencyCovered?: string;
  }>;
  insufficientEvidenceAreas: string[];
  recommendation: string;
  recommendationReasoning: string;
  confidence: string;
  confidenceScore: number;
  confidenceReasoning: string;
  aiSuggestedActions: string[];
  hrDecision?: {
    action: string;
    decisionNotes?: string;
    overriddenRecommendation: boolean;
    overrideReason?: string;
    decidedBy: string;
    decidedAt: Date;
  };
  status: string;
  failureReason?: string;
  metadata: {
    evaluationVersion: string;
    model: string;
    provider: string;
    evaluatedAt: Date;
    interviewDurationMinutes: number;
    totalQuestionsAnswered: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const AIInterviewEvaluationModel = mongoose.model<IAIInterviewEvaluationDocument>(
  'AIInterviewEvaluation',
  AIInterviewEvaluationSchema
);
