import { ICompanyRepository } from "@domain/repositories/ICompanyRepository";
import { IHRUserRepository } from "@domain/repositories/IHRUserRepository";
import { IGetCompaniesUseCase } from "../interfaces/IGetCompaniesUseCase.usecase";

export class GetCompaniesUseCase implements IGetCompaniesUseCase {
  constructor(
    private readonly _companyRepository: ICompanyRepository,
    private readonly _hrUserRepository: IHRUserRepository
  ) { }


  async execute(query: string, page: number, limit: number, status?: string) {
    const { hrUsers, total } = await this._hrUserRepository.searchHRUsers(query, page, limit, status);

    const companiesWithHR = await Promise.all(hrUsers.map(async (user) => {
      const company = await this._companyRepository.findById(user.companyId);
      const userJson = user.toJSON();
      const companyProps = company?.toJSON();

      return {
        id: userJson.id,
        companyId: companyProps?.id,
        name: companyProps?.name || "N/A",
        contactName: `${userJson.firstName} ${userJson.lastName}`,
        contactEmail: userJson.email,
        email: userJson.email,
        status: userJson.status,
        industry: companyProps?.industry || "N/A",
        website: companyProps?.website,
        location: companyProps?.location || companyProps?.headquarters || "N/A",
        description: companyProps?.description || "",
        contactPhone: companyProps?.contactPhone || ""
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
