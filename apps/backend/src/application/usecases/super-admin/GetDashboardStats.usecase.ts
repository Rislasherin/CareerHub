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
      // Assuming count is available in model or add count to repository
      // For now I'll use a simple count check if available or just 0
      (this._orgRepository as any).model.countDocuments(),
      (this._studentRepository as any).model.countDocuments(),
      (this._companyRepository as any).model.countDocuments(),
      (this._interviewerRepository as any).model.countDocuments(),
    ]);

    return {
      totalOrganizations: orgCount,
      totalStudents: studentCount,
      totalCompanies: companyCount,
      totalInterviewers: interviewerCount,
    };
  }
}
