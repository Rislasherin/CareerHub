import { GenerateFollowUpInputDTO } from '@application/dtos/ai-interview/GenerateFollowUp.dto';

export interface GenerateFollowUpOutput {
  success: boolean;
}

export interface IGenerateFollowUpUseCase {
  execute(input: GenerateFollowUpInputDTO): Promise<GenerateFollowUpOutput>;
}
