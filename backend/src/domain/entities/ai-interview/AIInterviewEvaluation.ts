import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { EvaluationStatus } from '@domain/enums/EvaluationStatus.enum';
import { CompetencyEvaluation } from '@domain/value-objects/CompetencyEvaluation';
import { QuestionEvaluationAnalysis } from '@domain/value-objects/QuestionEvaluationAnalysis';
import { HRDecision } from '@domain/value-objects/HRDecision';

export interface IEvaluationMetadata {
  evaluationVersion: string;
  model: string;
  provider: string;
  evaluatedAt: Date;
  interviewDurationMinutes: number;
  totalQuestionsAnswered: number;
}

export interface IAIInterviewEvaluationProps {
  id: string;
  interviewId: string;
  sessionId: string;
  studentId: string;
  jobId: string;
  companyId: string;
  overallScore: number | null;
  overallSummary: string;
  competencies: CompetencyEvaluation[];
  strengths: string[];
  developmentAreas: string[];
  questionAnalyses: QuestionEvaluationAnalysis[];
  insufficientEvidenceAreas: string[];
  recommendation: AIRecommendation;
  recommendationReasoning: string;
  confidence: EvaluationConfidence;
  confidenceScore: number;
  confidenceReasoning: string;
  aiSuggestedActions: string[];
  hrDecision?: HRDecision;
  status: EvaluationStatus;
  failureReason?: string;
  metadata: IEvaluationMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AIInterviewEvaluation {
  private readonly _id: string;
  private readonly _interviewId: string;
  private readonly _sessionId: string;
  private readonly _studentId: string;
  private readonly _jobId: string;
  private readonly _companyId: string;
  private _overallScore: number | null;
  private _overallSummary: string;
  private _competencies: CompetencyEvaluation[];
  private _strengths: string[];
  private _developmentAreas: string[];
  private _questionAnalyses: QuestionEvaluationAnalysis[];
  private _insufficientEvidenceAreas: string[];
  private _recommendation: AIRecommendation;
  private _recommendationReasoning: string;
  private _confidence: EvaluationConfidence;
  private _confidenceScore: number;
  private _confidenceReasoning: string;
  private _aiSuggestedActions: string[];
  private _hrDecision?: HRDecision;
  private _status: EvaluationStatus;
  private _failureReason?: string;
  private readonly _metadata: IEvaluationMetadata;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: IAIInterviewEvaluationProps) {
    if (!props.id || !props.interviewId || !props.sessionId || !props.studentId || !props.companyId) {
      throw new Error('[AIInterviewEvaluation] Missing essential identifiers.');
    }
    if (props.overallScore !== null && (props.overallScore < 0 || props.overallScore > 100)) {
      throw new Error(`[AIInterviewEvaluation] Overall score must be between 0 and 100 or null, got ${props.overallScore}.`);
    }
    if (props.confidenceScore < 0 || props.confidenceScore > 100) {
      throw new Error(`[AIInterviewEvaluation] Confidence score must be between 0 and 100, got ${props.confidenceScore}.`);
    }

    this._id = props.id;
    this._interviewId = props.interviewId;
    this._sessionId = props.sessionId;
    this._studentId = props.studentId;
    this._jobId = props.jobId || '';
    this._companyId = props.companyId;
    this._overallScore = props.overallScore !== null ? Math.round(props.overallScore) : null;
    this._overallSummary = props.overallSummary;
    this._competencies = [...props.competencies];
    this._strengths = [...props.strengths];
    this._developmentAreas = [...props.developmentAreas];
    this._questionAnalyses = [...props.questionAnalyses];
    this._insufficientEvidenceAreas = [...props.insufficientEvidenceAreas];
    this._recommendation = props.recommendation;
    this._recommendationReasoning = props.recommendationReasoning;
    this._confidence = props.confidence;
    this._confidenceScore = Math.round(props.confidenceScore);
    this._confidenceReasoning = props.confidenceReasoning;
    this._aiSuggestedActions = [...props.aiSuggestedActions];
    this._hrDecision = props.hrDecision;
    this._status = props.status;
    this._failureReason = props.failureReason;
    this._metadata = { ...props.metadata };
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  // ─── Getters ─────────────────────────────────────────────────────────

  get id(): string { return this._id; }
  get interviewId(): string { return this._interviewId; }
  get sessionId(): string { return this._sessionId; }
  get studentId(): string { return this._studentId; }
  get jobId(): string { return this._jobId; }
  get companyId(): string { return this._companyId; }
  get overallScore(): number | null { return this._overallScore; }
  get overallSummary(): string { return this._overallSummary; }
  get competencies(): ReadonlyArray<CompetencyEvaluation> { return [...this._competencies]; }
  get strengths(): ReadonlyArray<string> { return [...this._strengths]; }
  get developmentAreas(): ReadonlyArray<string> { return [...this._developmentAreas]; }
  get questionAnalyses(): ReadonlyArray<QuestionEvaluationAnalysis> { return [...this._questionAnalyses]; }
  get insufficientEvidenceAreas(): ReadonlyArray<string> { return [...this._insufficientEvidenceAreas]; }
  get recommendation(): AIRecommendation { return this._recommendation; }
  get recommendationReasoning(): string { return this._recommendationReasoning; }
  get confidence(): EvaluationConfidence { return this._confidence; }
  get confidenceScore(): number { return this._confidenceScore; }
  get confidenceReasoning(): string { return this._confidenceReasoning; }
  get aiSuggestedActions(): ReadonlyArray<string> { return [...this._aiSuggestedActions]; }
  get hrDecision(): HRDecision | undefined { return this._hrDecision; }
  get status(): EvaluationStatus { return this._status; }
  get failureReason(): string | undefined { return this._failureReason; }
  get metadata(): IEvaluationMetadata { return { ...this._metadata }; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // ─── Domain Methods ──────────────────────────────────────────────────

  recordHRDecision(decision: HRDecision): void {
    this._hrDecision = decision;
    this._updatedAt = new Date();
  }

  markAsEvaluating(): void {
    this._status = EvaluationStatus.EVALUATING;
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  markAsPending(): void {
    this._status = EvaluationStatus.PENDING;
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  markAsFailed(reason?: string): void {
    this._status = EvaluationStatus.FAILED;
    this._failureReason = reason;
    if (reason && !this._overallSummary) {
      this._overallSummary = `Evaluation failed: ${reason}`;
    }
    this._updatedAt = new Date();
  }

  markAsCompleted(): void {
    this._status = EvaluationStatus.COMPLETED;
    this._failureReason = undefined;
    this._updatedAt = new Date();
  }

  hasHROverride(): boolean {
    return this._hrDecision ? this._hrDecision.overriddenRecommendation : false;
  }
}
