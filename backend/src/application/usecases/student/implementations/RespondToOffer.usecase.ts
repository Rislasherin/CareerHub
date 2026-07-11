import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";
import { IRespondToOfferUseCase } from "../interfaces/IRespondToOffer.usecase";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export class RespondToOfferUseCase implements IRespondToOfferUseCase {
  constructor(
    private readonly _offerRepository: IOfferRepository,
    private readonly _jobApplicationRepository: IJobApplicationRepository,
    private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase
  ) {}
  async execute(studentId: string, offerId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<Record<string, unknown>> {
    const offer = await this._offerRepository.findById(offerId);
    
    if (!offer || offer.studentId !== studentId) {
      throw new AppError("Offer not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (offer.status !== OfferStatus.PENDING) {
      throw new AppError(`Offer is already ${offer.status}`, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (status === 'ACCEPTED') {
        offer.accept();
    } else {
        offer.reject();
    }
    await this._offerRepository.update(offerId, offer);

    const application = await this._jobApplicationRepository.findById(offer.applicationId);
    if (application) {
        if (status === 'ACCEPTED') {
            application.updateStatus(JobApplicationStatus.HIRED);
        } else {
            application.updateStatus(JobApplicationStatus.REJECTED);
        }
        await this._jobApplicationRepository.update(application.id!, application);

        // Notify HR of student's decision
        await this._createSystemNotificationUseCase.execute({
          recipientId: application.companyId,
          role: NotificationRole.HR,
          title: status === 'ACCEPTED' ? "Offer Accepted! 🎉" : "Offer Declined",
          message: status === 'ACCEPTED'
            ? `A student has accepted your job offer. The hiring is now complete!`
            : `A student has declined your job offer. You may proceed with other candidates.`,
          type: status === 'ACCEPTED' ? NotificationType.SUCCESS : NotificationType.WARNING,
          link: "/hr/offers"
        });
        return offer.toJson() as unknown as Record<string, unknown>;
    }

    return offer.toJson() as unknown as Record<string, unknown>;
  }
}
