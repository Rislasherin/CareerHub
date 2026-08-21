import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";

import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";

import { IGetStudentInterviewsUseCase } from "../interfaces/IGetStudentInterviews.usecase";

export class GetStudentInterviewsUseCase implements IGetStudentInterviewsUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _companyRepository: ICompanyRepository    ) { }

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

            return {
                id: inv.id,
                jobId: inv.jobId,
                type: inv.type,
                status: inv.status,
                scheduledAt: inv.scheduledAt,
                startedAt: inv.startedAt,
                completedAt: inv.completedAt,
                companyName,
                interviewerName
            };
        }));
    }
}