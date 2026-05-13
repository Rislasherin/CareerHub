import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";

export interface IGetDashboardStatsUseCase {
  execute(): Promise<any>;
}

export class GetDashboardStatsUseCase implements IGetDashboardStatsUseCase {
  constructor(
    private readonly _orgRepository: IOrganizationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _companyRepository: ICompanyRepository,
    private readonly _interviewerRepository: IInterviewerRepository
  ) {}

  async execute() {
    const [orgCount, studentCount, companyCount, interviewerCount] = await Promise.all([
      this._orgRepository.count({}),
      this._studentRepository.count({}),
      this._companyRepository.count({}),
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
