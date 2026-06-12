"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationsUseCase = void 0;
class GetOrganizationsUseCase {
    constructor(_orgRepository, _studentRepository, _collegeAdminRepository) {
        this._orgRepository = _orgRepository;
        this._studentRepository = _studentRepository;
        this._collegeAdminRepository = _collegeAdminRepository;
    }
    async execute(query, page, limit) {
        const { organizations, total } = await this._orgRepository.searchOrganizations(query, page, limit);
        const enrichedOrgs = await Promise.all(organizations.map(async (org) => {
            const [studentCount, admin] = await Promise.all([
                this._studentRepository.count({ collegeId: org.id }),
                this._collegeAdminRepository.findByOrgId(org.id)
            ]);
            const json = org.toJSON();
            return {
                ...json,
                countOfStudents: studentCount,
                email: admin?.email || 'No email',
                placementContactEmail: admin?.email || 'No email',
                placementContactPhone: admin?.phoneNumber || 'No phone'
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
exports.GetOrganizationsUseCase = GetOrganizationsUseCase;
