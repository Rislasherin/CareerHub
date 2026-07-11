import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export interface IApproveCancellationUseCase {
    execute(companyId: string, interviewId: string): Promise<void>;
}

export class ApproveCancellationUseCase implements IApproveCancellationUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
    ) {}

    async execute(companyId: string, interviewId: string): Promise<void> {
        const interview = await this._interviewRepository.findById(interviewId);

        if (!interview || interview.companyId !== companyId) {
            throw new AppError("Interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        if (interview.status !== InterviewStatus.CANCELLATION_REQUESTED) {
            throw new AppError("No pending cancellation request found", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        interview.approveCancellation();
        await this._interviewRepository.update(interviewId, interview);

        // Notify the student
        await this._createSystemNotificationUseCase.execute({
            recipientId: interview.studentId,
            role: NotificationRole.STUDENT,
            title: "Interview Cancelled",
            message: `Your interview "${interview.title}" has been cancelled. HR will be in touch regarding next steps.`,
            type: NotificationType.WARNING,
            link: "/student/interviews"
        });
    }
}
