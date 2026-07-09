import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IGetRescheduleRequestsUseCase } from "../interfaces/IGetRescheduleRequests.usecase";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { Interview } from "@domain/entities/Interview";

export class GetRescheduleRequestsUseCase implements IGetRescheduleRequestsUseCase {
    constructor(private readonly _interviewRepository: IInterviewRepository) {}

    async execute(companyId: string): Promise<any[]> {
        // Fetch all interviews for the company
        const allInterviews = await this._interviewRepository.findByCompanyId(companyId);
        
        // Filter only those with RESCHEDULE_REQUESTED status
        const requests = allInterviews.filter((inv: Interview) => inv.status === InterviewStatus.RESCHEDULE_REQUESTED);

        return requests.map((inv: Interview) => ({
            id: inv.id,
            jobId: inv.jobId,
            studentId: inv.studentId,
            interviewerId: inv.interviewerId,
            title: inv.title,
            type: inv.type,
            status: inv.status,
            scheduledAt: inv.scheduledAt,
            rescheduleRequest: inv.rescheduleRequest
        }));
    }
}
