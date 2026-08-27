import { Schema } from 'mongoose';
import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '@domain/enums/EvaluationStatus.enum';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';

const CompetencyEvaluationSubSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  score: { type: Number, default: null },
  status: { type: String, enum: ['EVALUATED', 'INSUFFICIENT_EVIDENCE'], required: true },
  explanation: { type: String, required: true },
  evidence: { type: [String], default: [] },
}, { _id: false });

const QuestionEvaluationAnalysisSubSchema = new Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  candidateAnswer: { type: String, required: true },
  score: { type: Number, required: true },
  feedback: { type: String, required: true },
  evidence: { type: [String], default: [] },
  competencyCovered: { type: String },
}, { _id: false });

const HRDecisionSubSchema = new Schema({
  action: { type: String, enum: Object.values(HRDecisionAction), required: true },
  decisionNotes: { type: String },
  overriddenRecommendation: { type: Boolean, required: true, default: false },
  overrideReason: { type: String },
  decidedBy: { type: String, required: true },
  decidedAt: { type: Date, required: true, default: Date.now },
}, { _id: false });

const EvaluationMetadataSubSchema = new Schema({
  evaluationVersion: { type: String, required: true, default: '1.0.0' },
  model: { type: String, required: true },
  provider: { type: String, required: true },
  evaluatedAt: { type: Date, required: true, default: Date.now },
  interviewDurationMinutes: { type: Number, required: true },
  totalQuestionsAnswered: { type: Number, required: true },
}, { _id: false });

export const AIInterviewEvaluationSchema = new Schema({
  interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'AIInterviewSession', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', index: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  overallScore: { type: Number, default: null },
  overallSummary: { type: String, default: '' },
  competencies: { type: [CompetencyEvaluationSubSchema], default: [] },
  strengths: { type: [String], default: [] },
  developmentAreas: { type: [String], default: [] },
  questionAnalyses: { type: [QuestionEvaluationAnalysisSubSchema], default: [] },
  insufficientEvidenceAreas: { type: [String], default: [] },
  recommendation: { type: String, enum: Object.values(AIRecommendation), default: AIRecommendation.CONSIDER },
  recommendationReasoning: { type: String, default: '' },
  confidence: { type: String, enum: Object.values(EvaluationConfidence), default: EvaluationConfidence.MEDIUM },
  confidenceScore: { type: Number, default: 50 },
  confidenceReasoning: { type: String, default: '' },
  aiSuggestedActions: { type: [String], default: [] },
  hrDecision: { type: HRDecisionSubSchema },
  status: { type: String, enum: Object.values(EvaluationStatus), default: EvaluationStatus.PENDING, required: true, index: true },
  failureReason: { type: String, default: null },
  metadata: { type: EvaluationMetadataSubSchema, default: () => ({
    evaluationVersion: '1.0.0',
    model: 'system',
    provider: 'system',
    evaluatedAt: new Date(),
    interviewDurationMinutes: 0,
    totalQuestionsAnswered: 0,
  }) },
}, {
  timestamps: true,
});
