import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { UpdateCompanyProfileRequestDto } from "@application/dtos/hr/settings/hr-settings.dto";

export interface IUpdateCompanyProfileUseCase {
  execute(companyId: string, data: UpdateCompanyProfileRequestDto): Promise<any>;
}

import { Company } from "@domain/entities/Company";

export class UpdateCompanyProfileUseCase implements IUpdateCompanyProfileUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) {}

  async execute(companyId: string, data: UpdateCompanyProfileRequestDto) {
    const company = await this._companyRepository.findById(companyId);
    
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    const updatedProps = company.toJSON();
    
    if (data.name !== undefined) updatedProps.name = data.name;
    if (data.industry !== undefined) updatedProps.industry = data.industry;
    if (data.size !== undefined) updatedProps.size = data.size;
    if (data.location !== undefined) {
      updatedProps.location = data.location;
      updatedProps.headquarters = data.location;
    }
    if (data.website !== undefined) updatedProps.website = data.website;
    if (data.logoUrl !== undefined) updatedProps.logoUrl = data.logoUrl;

    const updatedEntity = await this._companyRepository.update(companyId, Company.create(updatedProps));
    
    return updatedEntity.toJSON ? updatedEntity.toJSON() : updatedEntity;
  }
}
