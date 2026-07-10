import { SubmitFeedbackDto } from "@application/dtos/interviewer/SubmitFeedback.dto";
import { Interview } from "@domain/entities/Interview";

export interface ISubmitInterviewFeedbackUseCase {
    execute(interviewerId: string, interviewId: string, data:SubmitFeedbackDto): Promise<Interview>
}