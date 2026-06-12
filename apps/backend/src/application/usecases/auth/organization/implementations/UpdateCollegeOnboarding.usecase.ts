import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { UpdateCollegeOnboardingDto } from "@application/dtos/auth/collage/Request/UpdateCollegeOnboarding.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Organization } from "@domain/entities/Organization";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IUpdateCollegeOnboardingUseCase {
  execute(orgId: string, dto: UpdateCollegeOnboardingDto): Promise<any>;
}

export class UpdateCollegeOnboardingUseCase implements IUpdateCollegeOnboardingUseCase {
  constructor(private readonly _organizationRepository: IOrganizationRepository) { }

  async execute(orgId: string, dto: UpdateCollegeOnboardingDto) {
    const organization = await this._organizationRepository.findById(orgId);
    if (!organization) {
      throw new AppError("Organization not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    const currentProps = organization.toJSON();

    // Update fields based on step
    if (dto.step === 1) {
      if (dto.name) currentProps.name = dto.name;
      if (dto.shortName) currentProps.shortName = dto.shortName;
      if (dto.yearEstablished) currentProps.yearEstablished = dto.yearEstablished;
      if (dto.website) currentProps.website = dto.website;
      if (dto.address) currentProps.address = dto.address;
      if (dto.naacGrade) currentProps.naacGrade = dto.naacGrade;
      if (dto.placementCellName) currentProps.placementCellName = dto.placementCellName;
      if (dto.placementContactEmail) currentProps.placementContactEmail = dto.placementContactEmail;
      if (dto.placementContactPhone) currentProps.placementContactPhone = dto.placementContactPhone;
      if (dto.logoUrl) currentProps.logoUrl = dto.logoUrl;
      currentProps.onboardingStep = 1;
    } else if (dto.step === 2) {
      if (dto.activeBranches) currentProps.activeBranches = dto.activeBranches;
      if (dto.currentAcademicYear) currentProps.currentAcademicYear = dto.currentAcademicYear;
      if (dto.activePlacementBatch) currentProps.activePlacementBatch = dto.activePlacementBatch;
      currentProps.onboardingStep = 2;
    } else if (dto.step === 3) {
      if (dto.plan) currentProps.plan = dto.plan;
      currentProps.onboardingStep = 3;
      currentProps.status = UserStatus.ACTIVE;
    }

    const updatedOrg = await this._organizationRepository.update(orgId, Organization.create(currentProps));
    return updatedOrg.toJSON();
  }
}
