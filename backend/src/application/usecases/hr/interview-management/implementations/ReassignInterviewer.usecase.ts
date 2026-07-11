import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { InterviewType } from "@domain/enums/InterviewType.enum";
import { Interview } from "@domain/entities/Interview";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export interface ReassignInterviewerDto {
    companyId: string;
    interviewId: string;
    newInterviewerId: string;
    newScheduledAt?: Date;
}

export interface IReassignInterviewerUseCase {
    execute(dto: ReassignInterviewerDto): Promise<Interview>;
}

export class ReassignInterviewerUseCase implements IReassignInterviewerUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
    ) {}

    async execute(dto: ReassignInterviewerDto): Promise<Interview> {
        const { companyId, interviewId, newInterviewerId, newScheduledAt } = dto;

        const interview = await this._interviewRepository.findById(interviewId);

        if (!interview || interview.companyId !== companyId) {
            throw new AppError("Interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        if (interview.status !== InterviewStatus.CANCELLATION_REQUESTED && interview.status !== InterviewStatus.CANCELLED) {
            throw new AppError("Interview is not in cancellation pending or cancelled state", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        // Create a new interview with updated interviewer (and optional new time)
        const newInterviewProps = {
            jobId: interview.jobId,
            applicationId: interview.applicationId,
            studentId: interview.studentId,
            companyId: interview.companyId,
            interviewerId: newInterviewerId,
            title: interview.title,
            type: interview.type as InterviewType,
            roundNumber: interview.roundNumber,
            status: InterviewStatus.SCHEDULED,
            scheduledAt: newScheduledAt ?? interview.scheduledAt,
            durationMinutes: interview.durationMinutes,
            meetingLink: interview.meetingLink,
        };

        const newInterview = Interview.create(newInterviewProps);
        const savedInterview = await this._interviewRepository.create(newInterview);

        // Mark original as CANCELLED
        interview.approveCancellation();
        await this._interviewRepository.update(interviewId, interview);

        // Notify NEW interviewer
        await this._createSystemNotificationUseCase.execute({
            recipientId: newInterviewerId,
            role: NotificationRole.INTERVIEWER,
            title: "New Interview Assigned",
            message: `You have been reassigned to conduct the interview: "${interview.title}". Please check your schedule.`,
            type: NotificationType.INFO,
            link: "/interviewer/interviews"
        });

        // Notify STUDENT
        await this._createSystemNotificationUseCase.execute({
            recipientId: interview.studentId,
            role: NotificationRole.STUDENT,
            title: "Interview Rescheduled",
            message: `Your interview "${interview.title}" has been reassigned to a new interviewer${newScheduledAt ? " with an updated time" : ""}. Please check your interview schedule.`,
            type: NotificationType.INFO,
            link: "/student/interviews"
        });

        return savedInterview;
    }
}
