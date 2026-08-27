import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '@domain/enums/EvaluationStatus.enum';
import { HRDecisionAction } from '@domain/enums/HRDecisionAction.enum';
import { ICompetencyEvaluationProps } from '@domain/value-objects/CompetencyEvaluation';
import { IQuestionEvaluationAnalysisProps } from '@domain/value-objects/QuestionEvaluationAnalysis';

export interface IHRDecisionResponseDTO {
  action: HRDecisionAction;
  decisionNotes?: string;
  overriddenRecommendation: boolean;
  overrideReason?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface IInterviewEvaluationResponseDTO {
  id: string;
  interviewId: string;
  sessionId: string;
  studentId: string;
  jobId: string;
  companyId: string;
  overallScore: number | null;
  overallSummary: string;
  competencies: ICompetencyEvaluationProps[];
  strengths: string[];
  developmentAreas: string[];
  questionAnalyses: IQuestionEvaluationAnalysisProps[];
  insufficientEvidenceAreas: string[];
  recommendation: AIRecommendation;
  recommendationReasoning: string;
  confidence: EvaluationConfidence;
  confidenceScore: number;
  confidenceReasoning: string;
  aiSuggestedActions: string[];
  hrDecision?: IHRDecisionResponseDTO;
  status: EvaluationStatus;
  failureReason?: string;
  metadata: {
    evaluationVersion: string;
    model: string;
    provider: string;
    evaluatedAt: string;
    interviewDurationMinutes: number;
    totalQuestionsAnswered: number;
  };
  createdAt: string;
  updatedAt: string;
}
