"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHRJobsUseCase = void 0;
class GetHRJobsUseCase {
    constructor(_jobRepository) {
        this._jobRepository = _jobRepository;
    }
    async execute(companyId, filters, page, limit) {
        return await this._jobRepository.searchJobs({
            companyId,
            status: filters.status,
            searchQuery: filters.searchQuery
        }, page, limit);
    }
}
exports.GetHRJobsUseCase = GetHRJobsUseCase;
