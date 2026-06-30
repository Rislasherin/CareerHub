import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";

export interface IGetOrganizationsUseCase {
  execute(query: string, page: number, limit: number, status?: string): Promise<any>;
}
