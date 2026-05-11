"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStudentUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const account_status_enum_1 = require("@domain/enums/account-status.enum");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class CreateStudentUseCase {
    constructor(studentRepository, hashService, randomService, emailService) {
        this.studentRepository = studentRepository;
        this.hashService = hashService;
        this.randomService = randomService;
        this.emailService = emailService;
    }
    async execute(organizationId, dto) {
        const existingStudentByEmail = await this.studentRepository.findByEmail(dto.email);
        if (existingStudentByEmail) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.EMAIL_EXISTS);
        }
        const existingRollNumber = await this.studentRepository.existsByOrganizationAndRollNumber(organizationId, dto.rollNumber);
        if (existingRollNumber) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.ROLL_NUMBER_EXISTS);
        }
        const temporaryPassword = this.randomService.generateTemporaryPassword(12);
        const student = await this.studentRepository.create(account_entity_1.AccountEntity.create({
            role: role_enum_1.Role.STUDENT,
            email: dto.email.trim().toLowerCase(),
            passwordHash: await this.hashService.hash(temporaryPassword),
            status: account_status_enum_1.AccountStatus.ACTIVE,
            isFirstLogin: true,
            organizationId,
            fullName: dto.fullName.trim(),
            rollNumber: dto.rollNumber.trim(),
            branch: dto.branch.trim(),
            cgpa: dto.cgpa,
        }));
        await this.emailService.send({
            to: dto.email,
            subject: "CareerHub student account credentials",
            text: `Welcome to CareerHub. Your temporary password is ${temporaryPassword}`,
            html: `<p>Welcome to CareerHub.</p><p>Your temporary password is <strong>${temporaryPassword}</strong>.</p>`,
        });
        return {
            id: student.getId(),
            email: student.getEmail(),
            temporaryPasswordSent: true,
            isFirstLogin: true,
        };
    }
}
exports.CreateStudentUseCase = CreateStudentUseCase;
