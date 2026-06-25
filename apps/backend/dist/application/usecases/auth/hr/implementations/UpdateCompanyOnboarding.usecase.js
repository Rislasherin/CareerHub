"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompanyOnboardingUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Company_1 = require("@domain/entities/Company");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class UpdateCompanyOnboardingUseCase {
    constructor(_companyRepository) {
        this._companyRepository = _companyRepository;
    }
    async execute(companyId, dto) {
        const company = await this._companyRepository.findById(companyId);
        if (!company) {
            throw new AppError_1.AppError("Company not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const currentProps = company.toJSON();
        // Update fields based on step
        if (dto.step === 1) {
            if (dto.name)
                currentProps.name = dto.name;
            if (dto.website)
                currentProps.website = dto.website;
            if (dto.industry) {
                currentProps.industry = dto.industry;
                currentProps.sector = dto.industry; // sync with old field
            }
            if (dto.headquarters) {
                currentProps.headquarters = dto.headquarters;
                currentProps.location = dto.headquarters; // sync with old field
            }
            if (dto.description)
                currentProps.description = dto.description;
            currentProps.onboardingStep = 1;
        }
        else if (dto.step === 2) {
            if (dto.size)
                currentProps.size = dto.size;
            if (dto.industry) {
                currentProps.industry = dto.industry;
                currentProps.sector = dto.industry;
            }
            currentProps.onboardingStep = 2;
        }
        else if (dto.step === 3) {
            if (dto.contactName)
                currentProps.contactName = dto.contactName;
            if (dto.jobTitle)
                currentProps.contactJobTitle = dto.jobTitle;
            if (dto.contactEmail)
                currentProps.contactEmail = dto.contactEmail;
            if (dto.contactPhone)
                currentProps.contactPhone = dto.contactPhone;
            if (dto.preferredColleges)
                currentProps.preferredColleges = dto.preferredColleges;
            if (dto.logoUrl)
                currentProps.logoUrl = dto.logoUrl;
            currentProps.onboardingStep = 3;
            currentProps.status = user_status_enum_1.UserStatus.ACTIVE;
        }
        const updatedCompany = await this._companyRepository.update(companyId, Company_1.Company.create(currentProps));
        return updatedCompany.toJSON();
    }
}
exports.UpdateCompanyOnboardingUseCase = UpdateCompanyOnboardingUseCase;
