import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";

export interface IGetOrganizationsUseCase {
  execute(query: string, page: number, limit: number, status?: string): Promise<any>;
}
export class GetOrganizationsUseCase implements IGetOrganizationsUseCase {
  constructor(
    private readonly _orgRepository: IOrganizationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository
  ) { }

  async execute(query: string, page: number, limit: number, status?: string) {
    const { organizations, total } = await this._orgRepository.searchOrganizations(query, page, limit, status);

    const enrichedOrgs = await Promise.all(organizations.map(async (org) => {
      const [studentCount, admin] = await Promise.all([
        this._studentRepository.count({ collegeId: org.id }),
        this._collegeAdminRepository.findByOrgId(org.id!)
      ]);

      const json = org.toJSON();
      return {
        ...json,
        countOfStudents: studentCount,
        email: admin?.email || 'No email',
        placementContactEmail: admin?.email || 'No email',
        placementContactPhone: (admin as any)?.phoneNumber || 'No phone'
      };
    }));

    return {
      organizations: enrichedOrgs,
      total,
      page,
      limit
    };
  }
}
