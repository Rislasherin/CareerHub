"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCollegeOnboardingUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Organization_1 = require("@domain/entities/Organization");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class UpdateCollegeOnboardingUseCase {
    constructor(_organizationRepository) {
        this._organizationRepository = _organizationRepository;
    }
    async execute(orgId, dto) {
        const organization = await this._organizationRepository.findById(orgId);
        if (!organization) {
            throw new AppError_1.AppError("Organization not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const currentProps = organization.toJSON();
        // Update fields based on step
        if (dto.step === 1) {
            if (dto.name)
                currentProps.name = dto.name;
            if (dto.shortName)
                currentProps.shortName = dto.shortName;
            if (dto.yearEstablished)
                currentProps.yearEstablished = dto.yearEstablished;
            if (dto.website)
                currentProps.website = dto.website;
            if (dto.address)
                currentProps.address = dto.address;
            if (dto.naacGrade)
                currentProps.naacGrade = dto.naacGrade;
            if (dto.placementCellName)
                currentProps.placementCellName = dto.placementCellName;
            if (dto.placementContactEmail)
                currentProps.placementContactEmail = dto.placementContactEmail;
            if (dto.placementContactPhone)
                currentProps.placementContactPhone = dto.placementContactPhone;
            if (dto.logoUrl)
                currentProps.logoUrl = dto.logoUrl;
            currentProps.onboardingStep = 1;
        }
        else if (dto.step === 2) {
            if (dto.activeBranches)
                currentProps.activeBranches = dto.activeBranches;
            if (dto.currentAcademicYear)
                currentProps.currentAcademicYear = dto.currentAcademicYear;
            if (dto.activePlacementBatch)
                currentProps.activePlacementBatch = dto.activePlacementBatch;
            currentProps.onboardingStep = 2;
        }
        else if (dto.step === 3) {
            if (dto.plan)
                currentProps.plan = dto.plan;
            currentProps.onboardingStep = 3;
            currentProps.status = user_status_enum_1.UserStatus.ACTIVE;
        }
        const updatedOrg = await this._organizationRepository.update(orgId, Organization_1.Organization.create(currentProps));
        return updatedOrg.toJSON();
    }
}
exports.UpdateCollegeOnboardingUseCase = UpdateCollegeOnboardingUseCase;
