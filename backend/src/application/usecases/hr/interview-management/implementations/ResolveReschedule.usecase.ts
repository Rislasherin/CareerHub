import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IResolveRescheduleUseCase, ResolveRescheduleDto } from "../interfaces/IResolveReschedule.usecase";

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
        interview.resolveReschedule(data.approve, newDateObj, data.newTime);

        await this._interviewRepository.update(interview.id!, interview);
    }
}
