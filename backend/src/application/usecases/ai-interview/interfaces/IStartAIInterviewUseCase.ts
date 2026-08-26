import { StartAIInterviewInputDTO } from '@application/dtos/ai-interview/StartAIInterview.dto';

export interface StartAIInterviewOutput {
  success: boolean;
  phase: string;
  sessionId: string;
  token?: string;
  livekitUrl?: string;
  durationMinutes?: number;
}

export interface IStartAIInterviewUseCase {
  execute(input: StartAIInterviewInputDTO): Promise<StartAIInterviewOutput>;
}
