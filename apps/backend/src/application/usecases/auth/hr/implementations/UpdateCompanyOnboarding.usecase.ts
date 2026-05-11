import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { UpdateCompanyOnboardingDto } from "@application/dtos/auth/hr/Request/UpdateCompanyOnboarding.dto";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { Company } from "@domain/entities/Company";

export interface IUpdateCompanyOnboardingUseCase {
  execute(companyId: string, dto: UpdateCompanyOnboardingDto): Promise<any>;
}

export class UpdateCompanyOnboardingUseCase implements IUpdateCompanyOnboardingUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) {}

  async execute(companyId: string, dto: UpdateCompanyOnboardingDto) {
    const company = await this._companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.INTERNAL_ERROR);
    }

    const currentProps = company.toJSON();
    
    // Update fields based on step
    if (dto.step === 2) {
        currentProps.sector = dto.sector;
        currentProps.size = dto.size;
        currentProps.location = dto.location;
        currentProps.onboardingStep = 2;
    } else if (dto.step === 3) {
        currentProps.contactName = dto.contactName;
        currentProps.contactEmail = dto.contactEmail;
        currentProps.contactPhone = dto.contactPhone;
        currentProps.onboardingStep = 3; // Fully onboarded (or marked as 3)
    }

    const updatedCompany = await this._companyRepository.update(Company.create(currentProps));
    return updatedCompany.toJSON();
  }
}
