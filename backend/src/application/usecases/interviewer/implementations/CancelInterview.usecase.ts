import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { ICancelInterviewUseCase } from "../interfaces/ICancelInterview.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Interview } from "@domain/entities/Interview";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";

export class CancelInterviewUseCase implements ICancelInterviewUseCase {
    constructor(
        private readonly _interviewRepository: IInterviewRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
    ) {}

    async execute(interviewerId: string, interviewId: string, reason: string): Promise<Interview> {
        const interview = await this._interviewRepository.findById(interviewId);
        if (!interview || interview.interviewerId !== interviewerId) {
            throw new AppError("Interview not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        // Uses domain method — validates SCHEDULED status internally, sets CANCELLATION_REQUESTED
        interview.requestCancellation(reason);
        const updatedInterview = await this._interviewRepository.update(interviewId, interview);

        if (!updatedInterview) {
            throw new AppError("Failed to update interview", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
        }

        const application = await this._jobApplicationRepository.findById(updatedInterview.applicationId);

        if (application) {
            // Notify HR — pending approval
            await this._createSystemNotificationUseCase.execute({
                recipientId: application.companyId,
                role: NotificationRole.HR,
                title: "Cancellation Request — Action Required",
                message: `Interviewer requested to cancel the interview "${updatedInterview.title}". Reason: ${reason}. Please approve or reassign.`,
                type: NotificationType.WARNING,
                link: "/hr/interviews"
            });
        }

        return updatedInterview;
    }
}
