import { ProcessStudentAnswerInputDTO } from "@application/dtos/ai-interview/ProcessStudentAnswer.dto";
import { AIOrchestrationAction, AnswerRelevanceClassification } from "@application/interfaces/ai-interview/IAIInterviewOrchestrator";

export interface ProcessStudentAnswerOutput {
  success: boolean;
  action?: AIOrchestrationAction;
  acknowledgement?: string;
  spokenResponse?: string;
  relevance?: AnswerRelevanceClassification;
  nextQuestionId?: string;
  nextQuestionText?: string;
}

export interface IProcessStudentAnswerUseCase {
	execute(input: ProcessStudentAnswerInputDTO): Promise<ProcessStudentAnswerOutput>;
}