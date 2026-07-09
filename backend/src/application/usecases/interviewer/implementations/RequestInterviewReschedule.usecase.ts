import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IRequestInterviewRescheduleUseCase, RequestRescheduleDto } from "../interfaces/IRequestInterviewReschedule.usecase";

export class RequestInterviewRescheduleUseCase implements IRequestInterviewRescheduleUseCase {
    constructor(private readonly _interviewRepository: IInterviewRepository) {}

    async execute(data: RequestRescheduleDto): Promise<void> {
        const interview = await this._interviewRepository.findById(data.interviewId);
        if (!interview) {
            throw new Error("Interview not found");
        }
        
        if (interview.interviewerId.toString() !== data.interviewerId.toString()) {
            throw new Error("Unauthorized: Only the assigned interviewer can request a reschedule.");
        }

        interview.requestReschedule({
            reason: data.reason,
            preferredDate: new Date(data.preferredDate),
            preferredTime: data.preferredTime,
            noteToHr: data.noteToHr
        });

        await this._interviewRepository.update(interview.id!, interview);
    }
}
