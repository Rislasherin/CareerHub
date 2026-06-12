import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Company } from "@domain/entities/Company";
import { UserStatus } from "@domain/enums/user.status.enum";

export interface IUpdateCompanyOnboardingUseCase {
  execute(companyId: string, dto: UpdateCompanyOnboardingDto): Promise<any>;
}

export class UpdateCompanyOnboardingUseCase implements IUpdateCompanyOnboardingUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) { }

  async execute(companyId: string, dto: UpdateCompanyOnboardingDto) {
    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    const currentProps = company.toJSON();

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
      currentProps.onboardingStep = 1;
    } else if (dto.step === 2) {
      if (dto.size) currentProps.size = dto.size;
      if (dto.industry) {
        currentProps.industry = dto.industry;
        currentProps.sector = dto.industry;
      }
      currentProps.onboardingStep = 2;
    } else if (dto.step === 3) {
      if (dto.contactName) currentProps.contactName = dto.contactName;
      if (dto.jobTitle) currentProps.contactJobTitle = dto.jobTitle;
      if (dto.contactEmail) currentProps.contactEmail = dto.contactEmail;
      if (dto.contactPhone) currentProps.contactPhone = dto.contactPhone;
      if (dto.preferredColleges) currentProps.preferredColleges = dto.preferredColleges;
      if (dto.logoUrl) currentProps.logoUrl = dto.logoUrl;
      currentProps.onboardingStep = 3;
      currentProps.status = UserStatus.ACTIVE;
    }

    const updatedCompany = await this._companyRepository.update(companyId, Company.create(currentProps));
    return updatedCompany.toJSON();
  }
}
