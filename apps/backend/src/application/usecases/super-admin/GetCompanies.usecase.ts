import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";

export interface IGetCompaniesUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetCompaniesUseCase implements IGetCompaniesUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _hrUserRepository: IHRUserRepository
  ) {}

  async execute(query: string, page: number, limit: number) {
    const { hrUsers, total } = await this._hrUserRepository.searchHRUsers(query, page, limit);
    
    const companiesWithHR = await Promise.all(hrUsers.map(async (user) => {
      const company = await this._companyRepository.findById(user.companyId);
      const userJson = user.toJSON();
      const companyProps = company?.toJSON();
      
      return {
        id: userJson.id, // Use User ID for actions (blocking/deleting the person)
        companyId: companyProps?.id,
        name: companyProps?.name || "N/A",
        contactName: `${userJson.firstName} ${userJson.lastName}`,
        contactEmail: userJson.email,
        email: userJson.email, // for UI compatibility
        status: userJson.status, // Use User Status
        industry: companyProps?.industry || "N/A",
        website: companyProps?.website,
        location: companyProps?.location || companyProps?.headquarters || "N/A"
      };
    }));

    return {
      companies: companiesWithHR,
      total,
      page,
      limit
    };
  }
}
