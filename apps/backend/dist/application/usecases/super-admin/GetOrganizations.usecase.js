"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrganizationsUseCase = void 0;
class GetOrganizationsUseCase {
    constructor(_orgRepository) {
        this._orgRepository = _orgRepository;
    }
    async execute(query, page, limit) {
        const { organizations, total } = await this._orgRepository.searchOrganizations(query, page, limit);
        return {
            organizations: organizations.map(o => o.toJSON()),
            total,
            page,
            limit
        };
    }
}
exports.GetOrganizationsUseCase = GetOrganizationsUseCase;
