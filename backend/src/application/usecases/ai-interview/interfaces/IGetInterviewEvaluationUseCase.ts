import { AIInterviewEvaluation } from '@domain/entities/ai-interview/AIInterviewEvaluation';

export interface IGetInterviewEvaluationUseCase {
  execute(params: {
    interviewId: string;
    companyId: string;
  }): Promise<AIInterviewEvaluation | null>;
}
