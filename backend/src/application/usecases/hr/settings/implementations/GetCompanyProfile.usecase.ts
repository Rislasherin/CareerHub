import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IGetCompanyProfileUseCase {
  execute(companyId: string): Promise<any>;
}

export class GetCompanyProfileUseCase implements IGetCompanyProfileUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) {}

  async execute(companyId: string) {
    const company = await this._companyRepository.findById(companyId);
    
    if (!company) {
      throw new AppError("Company not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
    }

    return company.toJSON();
  }
}
