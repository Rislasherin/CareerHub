"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComptypeSignupUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const comptype_entity_1 = require("@domain/entities/comptype.entity");
const account_status_enum_1 = require("@domain/enums/account-status.enum");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class ComptypeSignupUseCase {
    constructor(hrRepository, comptypeRepository, hashService, emailService) {
        this.hrRepository = hrRepository;
        this.comptypeRepository = comptypeRepository;
        this.hashService = hashService;
        this.emailService = emailService;
    }
    async execute(dto) {
        const existingHr = await this.hrRepository.findByEmail(dto.email);
        if (existingHr) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.EMAIL_EXISTS);
        }
        const existingComptype = await this.comptypeRepository.findByName(dto.comptypeName);
        if (existingComptype) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.COMPtype_EXISTS);
        }
        const comptype = await this.comptypeRepository.create(comptype_entity_1.ComptypeEntity.create({
            name: dto.comptypeName,
            size: dto.comptypeSize,
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
            comptypeId: comptype.getId(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            designation: dto.designation,
        }));
        await this.emailService.send({
            to: dto.email,
            subject: "Welcome to CareerHub",
            text: `Your CareerHub HR account for ${dto.comptypeName} has been created.`,
            html: `<p>Your CareerHub HR account for <strong>${dto.comptypeName}</strong> has been created.</p>`,
        });
        return {
            comptypeId: comptype.getId(),
            hrId: hrUser.getId(),
        };
    }
}
exports.ComptypeSignupUseCase = ComptypeSignupUseCase;
