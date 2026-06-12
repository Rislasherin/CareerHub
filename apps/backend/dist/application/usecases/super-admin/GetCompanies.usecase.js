"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompaniesUseCase = void 0;
class GetCompaniesUseCase {
    constructor(_comptypeRepository, _hrUserRepository) {
        this._comptypeRepository = _comptypeRepository;
        this._hrUserRepository = _hrUserRepository;
    }
    async execute(query, page, limit) {
        const { hrUsers, total } = await this._hrUserRepository.searchHRUsers(query, page, limit);
        const companiesWithHR = await Promise.all(hrUsers.map(async (user) => {
            const comptype = await this._comptypeRepository.findById(user.comptypeId);
            const userJson = user.toJSON();
            const comptypeProps = comptype?.toJSON();
            return {
                id: userJson.id, // Use User ID for actions (blocking/deleting the person)
                comptypeId: comptypeProps?.id,
                name: comptypeProps?.name || "N/A",
                contactName: `${userJson.firstName} ${userJson.lastName}`,
                contactEmail: userJson.email,
                email: userJson.email, // for UI compatibility
                status: userJson.status, // Use User Status
                industry: comptypeProps?.industry || "N/A",
                website: comptypeProps?.website,
                location: comptypeProps?.location || comptypeProps?.headquarters || "N/A"
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
