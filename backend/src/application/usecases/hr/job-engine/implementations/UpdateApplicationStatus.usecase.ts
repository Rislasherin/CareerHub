import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { IUpdateApplicationStatusUseCase } from "../interfaces/IUpdateApplicationStatus.usecase";
import { JobApplication } from "@domain/entities/JobApplication";

import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class UpdateApplicationStatusUseCase implements IUpdateApplicationStatusUseCase {
  constructor(
      private readonly _jobApplicationRepository: IJobApplicationRepository,
      private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
  ) {}

  async execute(applicationId: string, companyId: string, status: JobApplicationStatus): Promise<void> {
    const application = await this._jobApplicationRepository.findById(applicationId);
    
    if (!application || String(application.companyId) !== String(companyId)) {
      throw new AppError("Application not found or unauthorized", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (status === JobApplicationStatus.NEXT_ROUND) {
      application.advanceRound();
    } else {
      application.updateStatus(status);
    }

    await this._jobApplicationRepository.update(applicationId, application);

    // Trigger Notification to Student
    let title = "Application Update";
    let message = `Your application status has been updated to: ${status}`;
    let type = NotificationType.INFO;

    if (status === JobApplicationStatus.SHORTLISTED || status === JobApplicationStatus.NEXT_ROUND) {
        title = "Congratulations! You've advanced.";
        message = `You have been shortlisted/advanced to the next round for your recent application.`;
        type = NotificationType.SUCCESS;
    } else if (status === JobApplicationStatus.REJECTED) {
        title = "Application Update";
        message = `Unfortunately, you have not been selected to move forward for your recent application.`;
        type = NotificationType.WARNING;
    }

    await this._createSystemNotificationUseCase.execute({
        recipientId: application.studentId,
        role: NotificationRole.STUDENT,
        title,
        message,
        type,
        link: "/student/applications"
    });
  }
}
