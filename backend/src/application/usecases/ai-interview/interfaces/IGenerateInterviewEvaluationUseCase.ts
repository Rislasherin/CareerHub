import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';

export type GenerateEvaluationResult = {
  status: 'STARTED_AND_COMPLETED' | 'ALREADY_IN_PROGRESS' | 'ALREADY_COMPLETED' | 'WAITING_FOR_ANSWERS' | 'FAILED';
  evaluation?: AIInterviewEvaluation;
  message?: string;
};

export interface IGenerateInterviewEvaluationUseCase {
  execute(params: {
    sessionId: string;
    interviewId?: string;
    forceRegenerate?: boolean;
  }): Promise<GenerateEvaluationResult>;
}
