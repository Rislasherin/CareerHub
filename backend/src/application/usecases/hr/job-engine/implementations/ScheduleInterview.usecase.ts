import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IScheduleInterviewUseCase } from "../interfaces/IScheduleInterview.usecase";
import { IJobApplicationDocument } from "@infrastructure/database/models/jobApplication.model";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { Interview } from "@domain/entities/Interview";

export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository
    ) { }

    async execute(companyId: string, dto: SheduleInterviewDto): Promise<Interview> {
        let application = await this._jobApplicationRepository.findById(dto.applicationId);
        
        // Fallback: The frontend might pass a studentId instead of an applicationId from the Candidate Profile page
        if (!application) {
            const studentApps = await this._jobApplicationRepository.findByStudentId(dto.applicationId);
            application = studentApps.find(app => app.companyId === companyId) || null;
        }

        if (!application) {
            
            throw new AppError("Application not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const interview = Interview.create({
            jobId: application.jobId,
            applicationId: application.id!,
            studentId: application.studentId,
            companyId: application.companyId,
            interviewerId: dto.interviewerId,
            title: dto.title,
            type: dto.type,
            status: InterviewStatus.SCHEDULED,
            scheduledAt: new Date(dto.scheduledAt),
            durationMinutes: dto.durationMinutes,
            meetingLink: dto.meetingLink
        })

        const savedInterview = await this._interviewRepository.create(interview);

        if (application.status !== JobApplicationStatus.INTERVIEWING) {
            application.updateStatus(JobApplicationStatus.INTERVIEWING);
            await this._jobApplicationRepository.update(application.id!, application);
        }
        return savedInterview
    }
}