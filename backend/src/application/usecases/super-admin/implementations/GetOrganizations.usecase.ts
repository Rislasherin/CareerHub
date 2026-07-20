import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IStudentRepository } from "@domain/repositories/IStudentRepository";
import { ICollegeAdminRepository } from "@domain/repositories/ICollegeAdminRepository";
import { IGetOrganizationsUseCase } from "../interfaces/IGetOrganizationsUseCase.usecase";

export class GetOrganizationsUseCase implements IGetOrganizationsUseCase {
  constructor(
    private readonly _orgRepository: IOrganizationRepository,
    private readonly _studentRepository: IStudentRepository,
    private readonly _collegeAdminRepository: ICollegeAdminRepository
  ) { }

  async execute(query: string, page: number, limit: number, status?: string) {
    const { organizations, total } = await this._orgRepository.searchOrganizations(query, page, limit, status);

    const enrichedOrgs = await Promise.all(organizations.map(async (org) => {
      const [studentCount, admin, sub] = await Promise.all([
        this._studentRepository.count({ collegeId: org.id }),
        this._collegeAdminRepository.findByOrgId(org.id!),
        import("@infrastructure/database/models/organizer/subscription.model.js").then(m => m.SubscriptionModel.findOne({ collegeId: org.id, status: 'ACTIVE' }).sort({ createdAt: -1 }).lean())
      ]);

      const json = org.toJSON();
      return {
        ...json,
        countOfStudents: studentCount,
        email: admin?.email || 'No email',
        placementContactEmail: admin?.email || 'No email',
        placementContactPhone: (admin as unknown as { phoneNumber?: string })?.phoneNumber || 'No phone',
        realPlan: (sub as any)?.planType || 'BASIC',
        realPlanEndDate: (sub as any)?.endDate || null
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

