"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterviewerUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const account_status_enum_1 = require("@domain/enums/account-status.enum");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class CreateInterviewerUseCase {
    constructor(interviewerRepository, hashService, randomService, emailService) {
        this.interviewerRepository = interviewerRepository;
        this.hashService = hashService;
        this.randomService = randomService;
        this.emailService = emailService;
    }
    async execute(companyId, dto) {
        const existingInterviewer = await this.interviewerRepository.findByEmail(dto.email);
        if (existingInterviewer) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.EMAIL_EXISTS);
        }
        const temporaryPassword = this.randomService.generateTemporaryPassword(12);
        const interviewer = await this.interviewerRepository.create(account_entity_1.AccountEntity.create({
            role: role_enum_1.Role.INTERVIEWER,
            email: dto.email.trim().toLowerCase(),
            passwordHash: await this.hashService.hash(temporaryPassword),
            status: account_status_enum_1.AccountStatus.ACTIVE,
            isFirstLogin: true,
            companyId,
            fullName: dto.fullName.trim(),
            designation: dto.designation.trim(),
            phone: dto.phone?.trim(),
        }));
        await this.emailService.send({
            to: dto.email,
            subject: "CareerHub interviewer account credentials",
            text: `Welcome to CareerHub. Your temporary password is ${temporaryPassword}`,
            html: `<p>Welcome to CareerHub.</p><p>Your temporary password is <strong>${temporaryPassword}</strong>.</p>`,
        });
        return {
            id: interviewer.getId(),
            email: interviewer.getEmail(),
            temporaryPasswordSent: true,
            isFirstLogin: true,
        };
    }
}
exports.CreateInterviewerUseCase = CreateInterviewerUseCase;
