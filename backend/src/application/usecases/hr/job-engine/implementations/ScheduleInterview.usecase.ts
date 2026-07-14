import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IScheduleInterviewUseCase } from "../interfaces/IScheduleInterview.usecase";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { Interview } from "@domain/entities/Interview";

import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase"
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class ScheduleInterviewUseCase implements IScheduleInterviewUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
    ) { }

    async execute(companyId: string, dto: SheduleInterviewDto): Promise<Interview> {
        let application = await this._jobApplicationRepository.findById(dto.applicationId);
        
        if (!application) {
            const studentApps = await this._jobApplicationRepository.findByStudentId(dto.applicationId);
            application = studentApps.find(app => app.companyId === companyId) || null;
        }

        if (!application) {
            
            throw new AppError("Application not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const scheduledDate = new Date(dto.scheduledAt);
        const startOfDay = new Date(scheduledDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(scheduledDate);
        endOfDay.setHours(23, 59, 59, 999);
        const interviewerInterviews = await this._interviewRepository.findByInterviewerId(dto.interviewerId);
        const dailyInterviews = interviewerInterviews.filter(inv => {
            if (inv.status === InterviewStatus.CANCELLED) return false;
            const invDate = new Date(inv.scheduledAt);
            return invDate >= startOfDay && invDate <= endOfDay;
        });

        if (dailyInterviews.length >= 5) {
            throw new AppError("This interviewer already has the maximum of 5 interviews scheduled for this day.", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        
        const interview = Interview.create({
            jobId: application.jobId,
            applicationId: application.id!,
            studentId: application.studentId,
            companyId: application.companyId,
            interviewerId: dto.interviewerId,
            title: dto.title,
            type: dto.type,
            roundNumber: dto.roundNumber,
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

        // Notify Student
        await this._createSystemNotificationUseCase.execute({
            recipientId: application.studentId,
            role: NotificationRole.STUDENT,
            title: "Interview Scheduled",
            message: `You have an interview scheduled for ${dto.title}. Please check your interviews tab for details.`,
            type: NotificationType.INFO,
            link: "/student/interviews"
        });

        // Notify Interviewer
        await this._createSystemNotificationUseCase.execute({
            recipientId: dto.interviewerId,
            role: NotificationRole.INTERVIEWER,
            title: "New Interview Assigned",
            message: `You have been assigned to conduct an interview: ${dto.title}`,
            type: NotificationType.INFO,
            link: "/interviewer/interviews"
        });

        return savedInterview
    }

}