"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompanyOnboardingUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Company_1 = require("@domain/entities/Company");
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
        if (dto.step === 2) {
            currentProps.sector = dto.sector;
            currentProps.size = dto.size;
            currentProps.location = dto.location;
            currentProps.onboardingStep = 2;
        }
        else if (dto.step === 3) {
            currentProps.contactName = dto.contactName;
            currentProps.contactEmail = dto.contactEmail;
            currentProps.contactPhone = dto.contactPhone;
            currentProps.onboardingStep = 3; // Fully onboarded (or marked as 3)
        }
        const updatedCompany = await this._companyRepository.update(companyId, Company_1.Company.create(currentProps));
        return updatedCompany.toJSON();
    }
}
exports.UpdateCompanyOnboardingUseCase = UpdateCompanyOnboardingUseCase;
