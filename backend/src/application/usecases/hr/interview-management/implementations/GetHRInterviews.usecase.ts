import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { Student } from "@domain/entities/student";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetHRInterviewsUseCase {
    execute(companyId: string): Promise<any[]>;
}

export class GetHRInterviewsUseCase implements IGetHRInterviewsUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _studentRepository: IStudentRepository,
        private readonly _interviewerRepository: IInterviewerRepository
    ) {}

    async execute(companyId: string): Promise<any[]> {
        console.log(`[DEBUG HR] Fetching interviews for companyId:`, companyId);
        let interviews = await this._interviewRepository.findByCompanyId(companyId);

        console.log(`[DEBUG HR] Found ${interviews.length} interviews`);
        
        return Promise.all(interviews.map(async (inv) => {
            let studentName = "Unknown Candidate";
            let studentCollege = "";
            let interviewerName = "Unknown Interviewer";
            let interviewerRole = "";

            if (inv.studentId) {
                try {
                    const student = await this._studentRepository.findById(inv.studentId);
                    if (student) {
                        studentName = `${student.firstName} ${student.lastName}`;
                        studentCollege = student.collegeId || "University";
                    }
                } catch (e) {
                    // Ignore CastError if ID is invalid
                }
            }

            if (inv.interviewerId) {
                try {
                    const interviewer = await this._interviewerRepository.findById(inv.interviewerId);
                    if (interviewer) {
                        interviewerName = `${interviewer.firstName} ${interviewer.lastName}`;
                        interviewerRole = interviewer.designation || "Interviewer";
                    }
                } catch (e) {
                    // Ignore CastError if ID is invalid
                }
            }

            return {
                id: inv.id,
                title: inv.title,
                type: inv.type,
                status: inv.status,
                scheduledAt: inv.scheduledAt,
                durationMinutes: inv.durationMinutes,
                rescheduleRequest: inv.rescheduleRequest,
                candidate: {
                    name: studentName,
                    college: studentCollege
                },
                interviewer: {
                    name: interviewerName,
                    role: interviewerRole
                }
            };
        }));
    }
}
