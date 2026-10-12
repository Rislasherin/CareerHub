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
      if (dto.name) currentProps.name = dto.name;
      if (dto.website) currentProps.website = dto.website;
      if (dto.industry) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry; // sync with old field
      }
      if (dto.headquarters) {
        currentProps.headquarters = dto.headquarters;
        currentProps.location = dto.headquarters; // sync with old field
      }
      if (dto.description) currentProps.description = dto.description;
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 1);
    } else if (dto.step === 2) {
      if (dto.size) currentProps.size = dto.size;
      if (dto.industry) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry;
      }
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 2);
    } else if (dto.step === 3) {
      if (dto.name) currentProps.name = dto.name;
      if (dto.website) currentProps.website = dto.website;
      if (dto.industry) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry;
      }
      if (dto.headquarters) {
        currentProps.headquarters = dto.headquarters;
        currentProps.location = dto.headquarters;
      }
      if (dto.description) currentProps.description = dto.description;
      if (dto.size) currentProps.size = dto.size;
      if (dto.contactName) currentProps.contactName = dto.contactName;
      if (dto.jobTitle) currentProps.contactJobTitle = dto.jobTitle;
      if (dto.contactEmail) currentProps.contactEmail = dto.contactEmail;
      if (dto.contactPhone) currentProps.contactPhone = dto.contactPhone;
      if (dto.preferredColleges) currentProps.preferredColleges = dto.preferredColleges;
      if (dto.logoUrl) currentProps.logoUrl = dto.logoUrl;
      if (dto.verificationDocument) currentProps.verificationDocument = dto.verificationDocument;
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
