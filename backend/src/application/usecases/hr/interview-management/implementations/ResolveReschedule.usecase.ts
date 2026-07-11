import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IResolveRescheduleUseCase, ResolveRescheduleDto } from "../interfaces/IResolveReschedule.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";

export class ResolveRescheduleUseCase implements IResolveRescheduleUseCase {
    constructor(private readonly _interviewRepository: IInterviewRepository) {}

    async execute(data: ResolveRescheduleDto): Promise<void> {
        const interview = await this._interviewRepository.findById(data.interviewId);
        if (!interview) {
            throw new Error("Interview not found");
        }
        
        if (interview.companyId.toString() !== data.companyId.toString()) {
            throw new Error("Unauthorized: Cannot resolve reschedule for another company's interview.");
        }

        const newDateObj = data.newDate ? new Date(data.newDate) : undefined;

        if (data.approve && newDateObj) {
            const startOfDay = new Date(newDateObj);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(newDateObj);
            endOfDay.setHours(23, 59, 59, 999);

            const interviewerInterviews = await this._interviewRepository.findByInterviewerId(interview.interviewerId);
            const dailyInterviews = interviewerInterviews.filter(inv => {
                if (inv.status === InterviewStatus.CANCELLED || inv.id === interview.id) return false;
                const invDate = new Date(inv.scheduledAt);
                return invDate >= startOfDay && invDate <= endOfDay;
            });

            if (dailyInterviews.length >= 5) {
                throw new AppError("This interviewer already has the maximum of 5 interviews scheduled for this new date.", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
            }
        }

        interview.resolveReschedule(data.approve, newDateObj, data.newTime);

        await this._interviewRepository.update(interview.id!, interview);
    }
}
