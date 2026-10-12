import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { UpdateCollegeOnboardingDto } from "@application/dtos/auth/collage/Request/UpdateCollegeOnboarding.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Organization } from "@domain/entities/Organization";
import { UserStatus } from "@domain/enums/user.status.enum";
import { IPlatformSettingsRepository } from "@domain/repositories/IPlatformSettingsRepository";
import { PlatformSettingsRepository } from "@infrastructure/repositories/PlatformSettingsRepository";

import { IUpdateCollegeOnboardingUseCase } from "../interfaces/IUpdateCollegeOnboarding.usecase";

export class UpdateCollegeOnboardingUseCase implements IUpdateCollegeOnboardingUseCase {
  constructor(
    private readonly _organizationRepository: IOrganizationRepository,
    private readonly _collegeAdminRepository?: ICollegeAdminRepository,
    private readonly _platformSettingsRepo?: IPlatformSettingsRepository
  ) { }

  async execute(orgId: string, dto: UpdateCollegeOnboardingDto) {
    const organization = await this._organizationRepository.findById(orgId);
    if (!organization) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    if (organization.status === UserStatus.ACTIVE && dto.resubmit) {
      throw new AppError("Cannot resubmit an already approved organization", HttpStatus.BAD_REQUEST, ErrorCode.INVALID_STATUS);
    }

    const currentProps = organization.toJSON();

    // Update fields based on step
    if (dto.step === 1) {
      if (dto.name !== undefined) {
        const trimmed = dto.name.trim();
        if (trimmed.length < 3) {
          throw new AppError("Institution name must be at least 3 characters long", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        if (/^Pending Institution/i.test(trimmed)) {
          throw new AppError("Invalid institution name: please enter your actual registered institution name", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        currentProps.name = trimmed;
      }
      if (dto.shortName !== undefined) currentProps.shortName = dto.shortName;
      if (dto.yearEstablished !== undefined) currentProps.yearEstablished = dto.yearEstablished;
      if (dto.website !== undefined) currentProps.website = dto.website;
      if (dto.address !== undefined) currentProps.address = dto.address;
      if (dto.city) currentProps.city = dto.city;
      if (dto.state) currentProps.state = dto.state;
      if (dto.naacGrade !== undefined) currentProps.naacGrade = dto.naacGrade;
      if (dto.placementCellName !== undefined) currentProps.placementCellName = dto.placementCellName;
      if (dto.placementContactEmail !== undefined) currentProps.placementContactEmail = dto.placementContactEmail;
      if (dto.placementContactPhone !== undefined) currentProps.placementContactPhone = dto.placementContactPhone;
      if (dto.logoUrl !== undefined) currentProps.logoUrl = dto.logoUrl;
      if (dto.verificationDocument !== undefined) currentProps.verificationDocument = dto.verificationDocument;
      if (dto.verificationDocuments !== undefined) {
        currentProps.verificationDocuments = dto.verificationDocuments.map(d => ({
          ...d,
          uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : new Date()
        }));
      }
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 1);
    } else if (dto.step === 2) {
      if (dto.activeBranches) currentProps.activeBranches = dto.activeBranches;
      if (dto.currentAcademicYear !== undefined) currentProps.currentAcademicYear = dto.currentAcademicYear;
      if (dto.activePlacementBatch !== undefined) currentProps.activePlacementBatch = dto.activePlacementBatch;
      currentProps.onboardingStep = Math.max(currentProps.onboardingStep || 0, 2);
    } else if (dto.step === 3) {
      if (dto.name !== undefined) {
        const trimmed = dto.name.trim();
        if (trimmed.length < 3) {
          throw new AppError("Institution name must be at least 3 characters long", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        if (/^Pending Institution/i.test(trimmed)) {
          throw new AppError("Invalid institution name: please enter your actual registered institution name", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        currentProps.name = trimmed;
      }

      // Enforce valid institution name for final submission
      if (!currentProps.name || /^Pending Institution/i.test(currentProps.name.trim())) {
        throw new AppError("A valid official institution name is required before final submission", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      if (dto.plan) currentProps.plan = dto.plan;
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
        throw new AppError("At least one official institution verification document is required before final submission", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }

      currentProps.onboardingStep = 3;
      
      let requireApproval = true;
      try {
        const settingsRepo = this._platformSettingsRepo || new PlatformSettingsRepository();
        const settings = await settingsRepo.getSettings();
        if (settings && typeof settings.requireApproval === 'boolean') {
          requireApproval = settings.requireApproval;
        }
      } catch {
        requireApproval = true;
      }

      if (requireApproval) {
        currentProps.status = UserStatus.PENDING;
      } else {
        currentProps.status = UserStatus.ACTIVE;
        // Start 14-day free trial on immediate approval
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);
        currentProps.trialEndsAt = trialEnd;
      }
    }

    // Handle resubmission transition if previously REJECTED or explicitly requested
    if (dto.resubmit || (dto.step === 3 && organization.status === UserStatus.REJECTED)) {
      currentProps.status = UserStatus.PENDING;
      currentProps.resubmittedAt = new Date();
      currentProps.onboardingStep = 3;
      
      if (!currentProps.statusHistory) {
        currentProps.statusHistory = [];
      }
      currentProps.statusHistory.push({
        status: UserStatus.PENDING,
        reason: 'Resubmitted for review',
        changedAt: new Date()
      });

      if (this._collegeAdminRepository) {
        const collegeAdmin = await this._collegeAdminRepository.findByOrgId(orgId);
        if (collegeAdmin) {
          collegeAdmin.status = UserStatus.PENDING;
          await this._collegeAdminRepository.update(collegeAdmin.id!, collegeAdmin);
        }
      }
    }

    // Validate duplicate organization name if changed
    if (dto.name && dto.name !== organization.name) {
      const existing = await this._organizationRepository.findByName(dto.name);
      if (existing) {
        throw new AppError('Organization name already exists', HttpStatus.CONFLICT, ErrorCode.RESOURCE_EXISTS);
      }
    }

    const updatedOrg = await this._organizationRepository.update(orgId, Organization.create(currentProps));
    return updatedOrg.toJSON();
  }
}
