import { logger } from "@infrastructure/logger/logger";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IGenerateOfferUseCase } from "../interfaces/IGenerateOffer.usecase";
import { IJobApplicationRepository } from "@domain/repositories/IJobApplicationRepository";
import { GenerateOfferDto } from "@application/dtos/hr/Request/GenerateOffer.dto";
import { Offer } from "@domain/entities/Offer";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { OfferStatus } from "@domain/enums/OfferStatus.enum";
import { Role } from "@domain/enums/Roles.enum";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";
import { StudentModel } from "@infrastructure/database/models/student/student.model";
import { CompanyModel } from "@infrastructure/database/models/company/company.model";
import { EmailService } from "@infrastructure/services/email/email.service";
import { ICreateSystemNotificationUseCase } from "@application/usecases/common/notifications/interfaces/ICreateSystemNotification.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";
import { IInterviewRepository } from "@domain/repositories/IInterviewRepository";
import { InterviewStatus } from "@domain/enums/InterviewStatus.enum";
export class GenerateOfferUseCase implements IGenerateOfferUseCase {
    constructor(
        private readonly _offerRepository: IOfferRepository,
        private readonly _jobApplicationRepository: IJobApplicationRepository,
        private readonly _createSystemNotificationUseCase: ICreateSystemNotificationUseCase,
        private readonly _interviewRepository: IInterviewRepository
    ) { }

    async execute(companyId: string, data: GenerateOfferDto): Promise<Offer> {
        const application = await this._jobApplicationRepository.findById(data.applicationId)

        if (!application) {
            throw new AppError("Application not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }
        if (application.companyId !== companyId) {
            throw new AppError("Unauthorized", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
        }
        const offer = Offer.create({
            jobId: application.jobId,
            applicationId: application.id as string,
            studentId: application.studentId,
            companyId: companyId,
            role: Role.STUDENT,
            ctc: data.ctc,
            joiningDate: new Date(data.joiningDate),
            expiresAt: new Date(data.expiresAt),
            status: OfferStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        const savedOffer = await this._offerRepository.create(offer)
        application.updateStatus(JobApplicationStatus.OFFERED);
        await this._jobApplicationRepository.update(application.id as string, application)

        try {
            const student = await StudentModel.findById(application.studentId);
            const company = await CompanyModel.findById(companyId);
            
            if (student && company) {
                const emailService = new EmailService();
                await emailService.sendOfferEmail(
                    student.email,
                    `${student.firstName} ${student.lastName}`,
                    data.role,
                    company.companyName
                );
            }
        } catch (e) {
            logger.error("Failed to send offer email", e);
        }

        // Notify Student — offer received
        await this._createSystemNotificationUseCase.execute({
            recipientId: application.studentId,
            role: NotificationRole.STUDENT,
            title: "🎉 You've Received an Offer!",
            message: `Congratulations! You have received a job offer. Please check your offers section to accept or decline.`,
            type: NotificationType.SUCCESS,
            link: "/student/offers"
        });

        return savedOffer
    }
}
