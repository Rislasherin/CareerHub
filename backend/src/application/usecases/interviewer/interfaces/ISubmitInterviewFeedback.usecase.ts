import { Interview } from "@domain/entities/Interview";
import { SubmitFeedbackDto } from "@application/dtos/interviewer/SubmitFeedback.dto";

export interface ISubmitInterviewFeedbackUseCase {
    execute(interviewerId: string, interviewId: string, feedbackData: SubmitFeedbackDto): Promise<Interview>;
}