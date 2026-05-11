import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";

export interface IGetCompaniesUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetCompaniesUseCase implements IGetCompaniesUseCase {
  constructor(private readonly _companyRepository: ICompanyRepository) {}

  async execute(query: string, page: number, limit: number) {
    const { companies, total } = await this._companyRepository.searchCompanies(query, page, limit);
    return {
      companies: companies.map(c => c.toJSON()),
      total,
      page,
      limit
    };
  }
}
