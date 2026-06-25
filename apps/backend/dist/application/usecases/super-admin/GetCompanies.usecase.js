"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompaniesUseCase = void 0;
class GetCompaniesUseCase {
    constructor(_companyRepository, _hrUserRepository) {
        this._companyRepository = _companyRepository;
        this._hrUserRepository = _hrUserRepository;
    }
    async execute(query, page, limit) {
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
exports.GetCompaniesUseCase = GetCompaniesUseCase;
