"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateComptypeOnboardingUseCase = void 0;
const AppError_1 = require("@application/errors/AppError");
const HttpStatus_enum_1 = require("@domain/enums/HttpStatus.enum");
const ErrorCodes_enum_1 = require("@domain/enums/ErrorCodes.enum");
const Comptype_1 = require("@domain/entities/Comptype");
const user_status_enum_1 = require("@domain/enums/user.status.enum");
class UpdateComptypeOnboardingUseCase {
    constructor(_comptypeRepository) {
        this._comptypeRepository = _comptypeRepository;
    }
    async execute(comptypeId, dto) {
        const comptype = await this._comptypeRepository.findById(comptypeId);
        if (!comptype) {
            throw new AppError_1.AppError("Comptype not found", HttpStatus_enum_1.HttpStatus.NOT_FOUND, ErrorCodes_enum_1.ErrorCode.INTERNAL_ERROR);
        }
        const currentProps = comptype.toJSON();
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
        const updatedComptype = await this._comptypeRepository.update(comptypeId, Comptype_1.Comptype.create(currentProps));
        return updatedComptype.toJSON();
    }
}
exports.UpdateComptypeOnboardingUseCase = UpdateComptypeOnboardingUseCase;
