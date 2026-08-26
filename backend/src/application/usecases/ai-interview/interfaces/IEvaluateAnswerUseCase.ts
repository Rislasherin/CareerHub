import { EvaluateAnswerInputDTO } from '@application/dtos/ai-interview/EvaluateAnswer.dto';

export interface EvaluateAnswerOutput {
  success: boolean;
}

export interface IEvaluateAnswerUseCase {
  execute(input: EvaluateAnswerInputDTO): Promise<EvaluateAnswerOutput>;
}
