import { AIRecommendation } from '@domain/enums/AIRecommendation.enum';
import { EvaluationConfidence } from '@domain/enums/EvaluationConfidence.enum';
import { CompetencyStatus } from '@domain/value-objects/CompetencyEvaluation';

export interface IEvaluationTranscriptItem {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  topic?: string;
  category?: string;
  quality?: string;
  feedback?: string;
  singleScore?: number;
}

export interface IEvaluationLLMInput {
  jobTitle: string;
  jobDescription?: string;
  experienceLevel: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  targetRubricCompetencies: Array<{
    name: string;
    category: string;
    description: string;
  }>;
  transcript: IEvaluationTranscriptItem[];
  totalInterviewDurationMinutes: number;
}

export interface IRawCompetencyOutput {
  name: string;
  category: string;
  score: number | null;
  status: CompetencyStatus;
  explanation: string;
  evidence: string[];
}

export interface IRawQuestionAnalysisOutput {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  evidence: string[];
  competencyCovered?: string;
}

export interface IEvaluationLLMOutput {
  overallScore: number | null;
  overallSummary: string;
  competencies: IRawCompetencyOutput[];
  strengths: string[];
  developmentAreas: string[];
  insufficientEvidenceAreas: string[];
  recommendation: AIRecommendation;
  recommendationReasoning: string;
  confidence: EvaluationConfidence;
  confidenceScore: number;
  confidenceReasoning: string;
  aiSuggestedActions: string[];
  modelInfo: {
    model: string;
    provider: string;
  };
}

export interface IInterviewEvaluationLLMService {
  evaluateFullInterview(input: IEvaluationLLMInput): Promise<IEvaluationLLMOutput>;
}
