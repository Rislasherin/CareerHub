import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";

export interface IGetOrganizationsUseCase {
  execute(query: string, page: number, limit: number): Promise<any>;
}

export class GetOrganizationsUseCase implements IGetOrganizationsUseCase {
  constructor(private readonly _orgRepository: IOrganizationRepository) {}

  async execute(query: string, page: number, limit: number) {
    const { organizations, total } = await this._orgRepository.searchOrganizations(query, page, limit);
    return {
      organizations: organizations.map(o => o.toJSON()),
      total,
      page,
      limit
    };
  }
}
