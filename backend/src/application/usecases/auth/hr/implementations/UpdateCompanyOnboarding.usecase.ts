import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Company } from "@domain/entities/Company";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IPlatformSettingsRepository } from "@domain/repositories/IPlatformSettingsRepository";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";

import { IUpdateCompanyOnboardingUseCase } from "../interfaces/IUpdateCompanyOnboarding.usecase";

export class UpdateCompanyOnboardingUseCase implements IUpdateCompanyOnboardingUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _hrUserRepository?: IHRUserRepository,
    private readonly _platformSettingsRepo?: IPlatformSettingsRepository
  ) { }

  async execute(companyId: string, dto: UpdateCompanyOnboardingDto) {
    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    const currentProps = company.toJSON();

    if (currentProps.status === UserStatus.ACTIVE && dto.resubmit) {
      throw new AppError("Cannot resubmit an already approved company", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
    }

    // Update fields based on step
    if (dto.step === 1) {
      if (dto.name !== undefined) {
        const trimmed = dto.name.trim();
        if (trimmed.length < 2) {
          throw new AppError("Company name must be at least 2 characters long", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        if (/^Pending Company/i.test(trimmed)) {
          throw new AppError("Invalid company name: please enter your actual registered company name", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        currentProps.name = trimmed;
      }
      if (dto.website !== undefined) currentProps.website = dto.website;
      if (dto.industry !== undefined) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry; // sync with old field
      }
      if (dto.headquarters !== undefined) {
        currentProps.headquarters = dto.headquarters;
        currentProps.location = dto.headquarters; // sync with old field
      }
      if (dto.description !== undefined) currentProps.description = dto.description;
      if (dto.verificationDocuments) {
        currentProps.verificationDocuments = dto.verificationDocuments.map(d => ({
          ...d,
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date()
        }));
      }
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 1);
    } else if (dto.step === 2) {
      if (dto.size) currentProps.size = dto.size;
      if (dto.industry) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry;
      }
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 2);
    } else if (dto.step === 3) {
      if (dto.name !== undefined) {
        const trimmed = dto.name.trim();
        if (trimmed.length < 2) {
          throw new AppError("Company name must be at least 2 characters long", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        if (/^Pending Company/i.test(trimmed)) {
          throw new AppError("Invalid company name: please enter your actual registered company name", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        currentProps.name = trimmed;
      }

      // Enforce valid company name for final submission
      if (!currentProps.name || /^Pending Company/i.test(currentProps.name.trim())) {
        throw new AppError("A valid registered company name is required before final submission", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      if (dto.website !== undefined) currentProps.website = dto.website;
      if (dto.industry !== undefined) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry;
      }
      if (dto.headquarters !== undefined) {
        currentProps.headquarters = dto.headquarters;
        currentProps.location = dto.headquarters;
      }
      if (dto.description !== undefined) currentProps.description = dto.description;
      if (dto.size !== undefined) currentProps.size = dto.size;
      if (dto.contactName !== undefined) currentProps.contactName = dto.contactName;
      if (dto.jobTitle !== undefined) currentProps.contactJobTitle = dto.jobTitle;
      if (dto.contactEmail !== undefined) currentProps.contactEmail = dto.contactEmail;
      if (dto.contactPhone !== undefined) currentProps.contactPhone = dto.contactPhone;
      if (dto.preferredColleges !== undefined) currentProps.preferredColleges = dto.preferredColleges;
      if (dto.logoUrl !== undefined) currentProps.logoUrl = dto.logoUrl;
      if (dto.verificationDocument !== undefined) currentProps.verificationDocument = dto.verificationDocument;
      if (dto.verificationDocuments !== undefined) {
        currentProps.verificationDocuments = dto.verificationDocuments.map(d => ({
          ...d,
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date()
        }));
      }

      if (currentProps.verificationDocuments && currentProps.verificationDocuments.length > 0 && !currentProps.verificationDocument) {
        currentProps.verificationDocument = currentProps.verificationDocuments[0].fileUrl;
      }

      // Validate at least one verification document
      const hasVerificationDoc = (currentProps.verificationDocuments && currentProps.verificationDocuments.length > 0) || !!currentProps.verificationDocument;
      if (!hasVerificationDoc) {
        throw new AppError("At least one official business verification document is required before final submission", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      currentProps.onboardingStep = 3;

      const isResubmission = dto.resubmit || currentProps.status === UserStatus.REJECTED;

      if (isResubmission) {
        currentProps.status = UserStatus.PENDING;
        currentProps.resubmittedAt = new Date();
        if (!currentProps.statusHistory) {
          currentProps.statusHistory = [];
        }
        currentProps.statusHistory.push({
          status: UserStatus.PENDING,
          changedAt: new Date(),
          reason: "Company application resubmitted for review"
        });

        // Update HR user status to PENDING
        if (this._hrUserRepository) {
          const hrUsers = await this._hrUserRepository.findByCompanyId(companyId);
          for (const hr of hrUsers) {
            if (hr.id) {
              await this._hrUserRepository.updateStatus(hr.id, UserStatus.PENDING);
            }
          }
        }
      } else {
        try {
          const settingsRepo = this._platformSettingsRepo || new PlatformSettingsRepository();
          const settings = await settingsRepo.getSettings();
          if (settings && settings.requireApproval) {
            currentProps.status = UserStatus.PENDING;
          } else {
            currentProps.status = UserStatus.ACTIVE;
          }
        } catch {
          currentProps.status = UserStatus.PENDING;
        }
      }
    }

    const updatedCompany = await this._companyRepository.update(companyId, Company.create(currentProps));
    return updatedCompany.toJSON();
  }
}
