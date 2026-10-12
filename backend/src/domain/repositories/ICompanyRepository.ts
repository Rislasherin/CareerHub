import { Company } from "@domain/entities/Company";
import { IBaseRepository } from "./IBaseRepository";

export interface ICompanyRepository extends IBaseRepository<Company> {
  findByName(name: string): Promise<Company | null>;
  searchCompanies(query: string, page: number, limit: number, status?: string): Promise<{ companies: Company[], total: number }>;
  updateStatus(id: string, status: string, blockedBy?: string, rejectionReason?: string, adminId?: string): Promise<void>;
}
