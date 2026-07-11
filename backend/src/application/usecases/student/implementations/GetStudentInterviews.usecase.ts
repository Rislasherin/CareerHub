import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";

import { IGetStudentInterviewsUseCase } from "../interfaces/IGetStudentInterviews.usecase";

export class GetStudentInterviewsUseCase implements IGetStudentInterviewsUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _companyRepository: ICompanyRepository,
        private readonly _interviewerRepository: IInterviewerRepository
    ) { }

    async execute(studentId: string): Promise<any[]> {
        const interview = await this._interviewRepository.findByStudentId(studentId);
        return Promise.all(interview.map(async (inv) => {
            let companyName = "Company";
            let interviewerName = "Pending Assignment"
            if (inv.companyId) {
                try {
                    const company = await this._companyRepository.findById(inv.companyId);
                    if (company) {
                        companyName = company.name;
                    }
                } catch (error) { }
            }

            if (inv.interviewerId) {
                try {
                    // FIX: Use _interviewerRepository instead of _interviewRepository
                    const interviewer = await this._interviewerRepository.findById(inv.interviewerId);
                    if (interviewer) {
                        interviewerName = `${interviewer.firstName} ${interviewer.lastName}`;
                    }
                } catch (error) { }
            }

            return {
                id: inv.id,
                title: inv.title,
                type: inv.type,
                status: inv.status,
                scheduledAt: inv.scheduledAt,
                durationMinutes: inv.durationMinutes,
                meetingLink: inv.meetingLink,
                companyName,
                interviewerName
            };
        }));
    }
}