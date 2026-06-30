import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IInterviewerRepository } from "@domain/repositories/IInterviewerRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";

export interface IGetDashboardStatsUseCase {
  execute(): Promise<any>;
}
