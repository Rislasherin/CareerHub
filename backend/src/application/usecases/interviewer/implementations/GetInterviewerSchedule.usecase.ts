import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { InterviewRepository } from "@infrastructure/repositories/interview.repository";
import { StudentRepository } from "@infrastructure/repositories/student.repository";
import { IGetInterviewerScheduleUseCase } from "../interfaces/IGetInterviewerSchedule.usecase";
import { Interviewer } from "@domain/entities/Interviewer";

export class GetInterviewerScheduleUseCase implements IGetInterviewerScheduleUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _studentRepository: IStudentRepository,
        private readonly _jobRepository: IJobRepository
    ) { }

    async execute(interviewerId: string): Promise<any[]> {
        const interviews = await this._interviewRepository.findByInterviewerId(interviewerId)

        const hydratedInterviews = await Promise.all(interviews.map(async (interview) => {
            let student = null;
            let job = null;
            
            try {
                if (interview.studentId) student = await this._studentRepository.findById(interview.studentId);
            } catch(e) {}
            
            try {
                if (interview.jobId) job = await this._jobRepository.findById(interview.jobId);
            } catch(e) {}

            return {
                id: interview.id,
                title: interview.title,
                type: interview.type,
                status: interview.status,
                scheduledAt: interview.scheduledAt,
                durationMinutes: interview.durationMinutes,
                meetingLink: interview.meetingLink,
                rescheduleRequest: interview.rescheduleRequest,
                candidate: {
                    id: student?.id,
                    name: `${student?.firstName} ${student?.lastName}`,
                    email: student?.email,
                    resumeUrl: student?.resume?.url,
                    cgpa: student?.cgpa,
                    branch: student?.branch,
                    degree: student?.degree,
                    graduationYear: student?.graduationYear,
                    experience: student?.experience || [],
                    projects: student?.projects || [],
                    skills: student?.skills || {},
                    resumeScore: student?.resumeScore || 0
                },
                job: {
                    id: job?.id,
                    title: job?.title,
                    requiredSkills: job?.requiredSkills || []
                }
            };
        }));

        return hydratedInterviews
    }
}