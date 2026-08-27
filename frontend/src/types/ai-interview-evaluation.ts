export type AIRecommendation = 'STRONG_PROCEED' | 'PROCEED' | 'CONSIDER' | 'DO_NOT_PROCEED';
export type EvaluationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type EvaluationStatus = 'PENDING' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
export type HRDecisionAction = 'SHORTLIST' | 'NEXT_ROUND' | 'HOLD' | 'REJECT' | 'HIRE';
export type CompetencyStatus = 'EVALUATED' | 'INSUFFICIENT_EVIDENCE';

export interface ICompetencyEvaluation {
  name: string;
  category: string;
  score: number | null;
  status: CompetencyStatus;
  explanation: string;
  evidence: string[];
}

export interface IQuestionEvaluationAnalysis {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  evidence: string[];
  competencyCovered?: string;
}

export interface IHRDecision {
  action: HRDecisionAction;
  decisionNotes?: string;
  overriddenRecommendation: boolean;
  overrideReason?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface IEvaluationMetadata {
  evaluationVersion: string;
  model: string;
  provider: string;
  evaluatedAt: string;
  interviewDurationMinutes: number;
  totalQuestionsAnswered: number;
}

export interface IAIInterviewEvaluation {
  id: string;
  interviewId: string;
  sessionId: string;
  studentId: string;
  jobId: string;
  companyId: string;
  overallScore: number | null;
  overallSummary: string;
  competencies: ICompetencyEvaluation[];
  strengths: string[];
  developmentAreas: string[];
  questionAnalyses: IQuestionEvaluationAnalysis[];
  insufficientEvidenceAreas: string[];
  recommendation: AIRecommendation;
  recommendationReasoning: string;
  confidence: EvaluationConfidence;
  confidenceScore: number;
  confidenceReasoning: string;
  aiSuggestedActions: string[];
  hrDecision?: IHRDecision;
  status: EvaluationStatus;
  failureReason?: string;
  metadata: IEvaluationMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface IRecordHRDecisionPayload {
  action: HRDecisionAction;
  decisionNotes?: string;
  overrideReason?: string;
}
