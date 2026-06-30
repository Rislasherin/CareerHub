import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";

export interface IGetCompaniesUseCase {
  execute(query: string, page: number, limit: number, status?: string): Promise<any>;
}
