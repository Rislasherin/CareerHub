import { ProcessStudentAnswerInputDTO } from "@application/dtos/ai-interview/ProcessStudentAnswer.dto";

export interface ProcessStudentAnswerOutput {
  success: boolean;
}

export interface IProcessStudentAnswerUseCase {
	execute(input: ProcessStudentAnswerInputDTO): Promise<ProcessStudentAnswerOutput>;
}