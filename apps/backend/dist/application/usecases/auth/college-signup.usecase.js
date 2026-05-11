"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollegeSignupUseCase = void 0;
const validation_error_1 = require("@application/errors/validation.error");
const account_entity_1 = require("@domain/entities/account.entity");
const organization_entity_1 = require("@domain/entities/organization.entity");
const account_status_enum_1 = require("@domain/enums/account-status.enum");
const role_enum_1 = require("@domain/enums/role.enum");
const message_constants_1 = require("@shared/constants/message.constants");
class CollegeSignupUseCase {
    constructor(collegeAdminRepository, organizationRepository, hashService, emailService) {
        this.collegeAdminRepository = collegeAdminRepository;
        this.organizationRepository = organizationRepository;
        this.hashService = hashService;
        this.emailService = emailService;
    }
    async execute(dto) {
        const existingAdmin = await this.collegeAdminRepository.findByEmail(dto.email);
        if (existingAdmin) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.EMAIL_EXISTS);
        }
        const existingOrganization = await this.organizationRepository.findByName(dto.name);
        if (existingOrganization) {
            throw new validation_error_1.ConflictError(message_constants_1.MESSAGE_CONSTANTS.CONFLICT.ORGANIZATION_EXISTS);
        }
        const organization = await this.organizationRepository.create(organization_entity_1.OrganizationEntity.create({
            name: dto.name,
            shortName: dto.shortName,
            collegeType: dto.collegeType,
            city: dto.city,
            state: dto.state,
            website: dto.website,
            placementCellName: dto.placementCellName,
            activeBatch: dto.activeBatch,
            naacGrade: dto.naacGrade,
        }));
        const collegeAdmin = await this.collegeAdminRepository.create(account_entity_1.AccountEntity.create({
            role: role_enum_1.Role.COLLEGE_ADMIN,
            email: dto.email.trim().toLowerCase(),
            passwordHash: await this.hashService.hash(dto.password),
            status: account_status_enum_1.AccountStatus.ACTIVE,
            isFirstLogin: false,
            organizationId: organization.getId(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            designation: dto.designation,
            phone: dto.phone,
        }));
        await this.emailService.send({
            to: dto.email,
            subject: "Welcome to CareerHub",
            text: `Your CareerHub college admin account for ${dto.name} has been created.`,
            html: `<p>Your CareerHub college admin account for <strong>${dto.name}</strong> has been created.</p>`,
        });
        return {
            organizationId: organization.getId(),
            adminId: collegeAdmin.getId(),
        };
    }
}
exports.CollegeSignupUseCase = CollegeSignupUseCase;
