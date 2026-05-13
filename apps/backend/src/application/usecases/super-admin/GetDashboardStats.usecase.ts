import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";

export interface IGetDashboardStatsUseCase {
  execute(): Promise<any>;
}

export class GetDashboardStatsUseCase implements IGetDashboardStatsUseCase {
  constructor(
    private readonly _orgRepository: IOrganizationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _interviewerRepository: IInterviewerRepository,
    private readonly _hrUserRepository: IHRUserRepository
  ) {}

  async execute() {
    const [orgCount, studentCount, companyCount, interviewerCount] = await Promise.all([
      this._orgRepository.count({}),
      this._studentRepository.count({}),
      this._hrUserRepository.count({}),
      this._interviewerRepository.count({}),
    ]);

    return {
      organizations: orgCount,
      students: studentCount,
      companies: companyCount,
      interviewers: interviewerCount,
    };
  }
}
