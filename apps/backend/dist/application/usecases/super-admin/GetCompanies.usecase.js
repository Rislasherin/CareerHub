"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompaniesUseCase = void 0;
class GetCompaniesUseCase {
    constructor(_companyRepository) {
        this._companyRepository = _companyRepository;
    }
    async execute(query, page, limit) {
        const { companies, total } = await this._companyRepository.searchCompanies(query, page, limit);
        return {
            companies: companies.map(c => c.toJSON()),
            total,
            page,
            limit
        };
    }
}
exports.GetCompaniesUseCase = GetCompaniesUseCase;
