import { ISendRenewalReminderUseCase } from "../interfaces/ISendRenewalReminder.usecase";
import { ISubscriptionRepository } from "@domain/repositories/ISubscriptionRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { IEmailService } from "@application/services/IEmailService";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class SendRenewalReminderUseCase implements ISendRenewalReminderUseCase {
  constructor(
    private readonly subRepo: ISubscriptionRepository,
    private readonly orgRepo: IOrganizationRepository,
    private readonly emailService: IEmailService,
    private readonly collegeAdminRepo?: ICollegeAdminRepository
  ) {}

  async execute(subscriptionId: string): Promise<void> {
    // 1. Verify subscription exists
    const subscription = await this.subRepo.findById(subscriptionId);
    if (!subscription) {
      throw new AppError("Subscription not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // 2. Verify organization/company exists
    const organization = await this.orgRepo.findById(subscription.collegeId);
    if (!organization) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    // 3. Determine placement contact email
    let contactEmail = organization.toJSON().placementContactEmail;
    if (!contactEmail && this.collegeAdminRepo && organization.id) {
      const collegeAdmin = await this.collegeAdminRepo.findByOrgId(organization.id);
      if (collegeAdmin) {
        contactEmail = collegeAdmin.email;
      }
    }

    if (!contactEmail) {
      throw new AppError("Organization placement contact email not found", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // 4. Send renewal reminder email through the email service
    const emailSent = await this.emailService.sendRenewalReminder(
      contactEmail,
      organization.name,
      subscription.planType,
      subscription.endDate || new Date()
    );

    if (!emailSent) {
      throw new AppError("Unable to send renewal reminder email. Please try again.", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }
  }
}
