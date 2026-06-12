"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHRJobsUseCase = void 0;
class GetHRJobsUseCase {
    constructor(_jobRepository) {
        this._jobRepository = _jobRepository;
    }
    async execute(comptypeId, filters, page, limit) {
        return await this._jobRepository.searchJobs({
            comptypeId,
            status: filters.status,
            searchQuery: filters.searchQuery
        }, page, limit);
    }
}
exports.GetHRJobsUseCase = GetHRJobsUseCase;
