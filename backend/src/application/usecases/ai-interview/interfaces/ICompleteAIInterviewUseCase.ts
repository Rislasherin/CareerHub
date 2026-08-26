import { CompleteAIInterviewInputDTO } from '@application/dtos/ai-interview/CompleteAIInterview.dto';

export interface CompleteAIInterviewOutput {
  success: boolean;
}

export interface ICompleteAIInterviewUseCase {
  execute(input: CompleteAIInterviewInputDTO): Promise<CompleteAIInterviewOutput>;
}
