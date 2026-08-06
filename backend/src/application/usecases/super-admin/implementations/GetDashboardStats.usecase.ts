import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";

import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IGetDashboardStatsUseCase } from "../interfaces/IGetDashboardStatsUseCase.usecase";

export class GetDashboardStatsUseCase implements IGetDashboardStatsUseCase {
  constructor(
    private readonly _orgRepository: IOrganizationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _companyRepository: ICompanyRepository,
    
    private readonly _hrUserRepository: IHRUserRepository
  ) { }

  async execute() {
    const [orgCount, studentCount, companyCount] = await Promise.all([
      this._orgRepository.count({}),
      this._studentRepository.count({}),
      this._hrUserRepository.count({}),
    ]);

    return {
      organizations: orgCount,
      students: studentCount,
      companies: companyCount,
    };
  }
}

