import { Interview } from "@domain/entities/Interview";

export interface ICancelInterviewUseCase {
    execute(interviewerId: string, interviewId: string, reason: string): Promise<Interview>;
}
