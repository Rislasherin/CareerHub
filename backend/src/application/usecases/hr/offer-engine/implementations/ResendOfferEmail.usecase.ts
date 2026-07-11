import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IOfferRepository } from "@domain/repositories/IOfferRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { EmailService } from "@infrastructure/services/email/email.service";
import { IResendOfferEmailUseCase } from "../interfaces/IResendOfferEmail.usecase";

export class ResendOfferEmailUseCase implements IResendOfferEmailUseCase {
    constructor(
        private readonly _offerRepository: IOfferRepository,
        private readonly _studentRepository: IStudentRepository,
        private readonly _companyRepository: ICompanyRepository,
        private readonly _emailService: EmailService
    ) {}

    async execute(companyId: string, offerId: string): Promise<void> {
        const offer = await this._offerRepository.findById(offerId);
        
        if (!offer || offer.companyId !== companyId) {
            throw new AppError("Offer not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }

        const student = await this._studentRepository.findById(offer.studentId);
        const company = await this._companyRepository.findById(offer.companyId);

        if (student && company) {
            await this._emailService.sendOfferEmail(
                student.email,
                `${student.firstName} ${student.lastName}`,
                offer.role,
                company.name
            );
        }
    }
}
