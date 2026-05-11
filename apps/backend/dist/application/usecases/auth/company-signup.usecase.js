"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySignupUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const company_entity_1 = require("@domain/entities/company.entity");
const account_status_enum_1 = require("@domain/enums/account-status.enum");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class CompanySignupUseCase {
    constructor(hrRepository, companyRepository, hashService, emailService) {
        this.hrRepository = hrRepository;
        this.companyRepository = companyRepository;
        this.hashService = hashService;
        this.emailService = emailService;
    }
    async execute(dto) {
        const existingHr = await this.hrRepository.findByEmail(dto.email);
        if (existingHr) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.EMAIL_EXISTS);
        }
        const existingCompany = await this.companyRepository.findByName(dto.companyName);
        if (existingCompany) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.COMPANY_EXISTS);
        }
        const company = await this.companyRepository.create(company_entity_1.CompanyEntity.create({
            name: dto.companyName,
            size: dto.companySize,
            industry: dto.industry,
            primaryContactName: dto.primaryContactName,
            primaryContactEmail: dto.email,
            primaryContactPhone: dto.primaryContactPhone,
        }));
        const hrUser = await this.hrRepository.create(account_entity_1.AccountEntity.create({
            role: role_enum_1.Role.HR,
            email: dto.email.trim().toLowerCase(),
            passwordHash: await this.hashService.hash(dto.password),
            status: account_status_enum_1.AccountStatus.ACTIVE,
            isFirstLogin: false,
            companyId: company.getId(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            designation: dto.designation,
        }));
        await this.emailService.send({
            to: dto.email,
            subject: "Welcome to CareerHub",
            text: `Your CareerHub HR account for ${dto.companyName} has been created.`,
            html: `<p>Your CareerHub HR account for <strong>${dto.companyName}</strong> has been created.</p>`,
        });
        return {
            companyId: company.getId(),
            hrId: hrUser.getId(),
        };
    }
}
exports.CompanySignupUseCase = CompanySignupUseCase;
