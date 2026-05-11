import { Company } from "@domain/entities/Company";
import { IBaseRepository } from "./IBaseRepository";

export interface ICompanyRepository extends IBaseRepository<Company> {
  findByName(name: string): Promise<Company | null>;
  update(entity: Company): Promise<Company>;
  searchCompanies(query: string, page: number, limit: number): Promise<{ companies: Company[], total: number }>;
}
