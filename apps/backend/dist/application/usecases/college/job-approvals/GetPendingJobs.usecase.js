"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPendingJobsUseCase = void 0;
const JobStatus_enum_1 = require("@domain/enums/JobStatus.enum");
class GetPendingJobsUseCase {
    constructor(_jobRepository, _organizationRepository) {
        this._jobRepository = _jobRepository;
        this._organizationRepository = _organizationRepository;
    }
    async execute(collegeId, status = JobStatus_enum_1.JobStatus.PENDING_REVIEW) {
        const jobs = await this._jobRepository.findByCollegeIdAndStatus(collegeId, status);
        // Smart Branch Routing: For pending review queue, automatically filter out jobs 
        // that have eligible branches which do NOT overlap with the college's activeBranches.
        if (status === JobStatus_enum_1.JobStatus.PENDING_REVIEW) {
            const organization = await this._organizationRepository.findById(collegeId);
            if (organization) {
                const collegeBranches = organization.activeBranches || [];
                return jobs.filter((job) => {
                    const eligibleBranches = job.eligibility?.eligibleBranches || [];
                    // If no specific branch restriction or set to "ALL", keep the job
                    if (eligibleBranches.length === 0 || eligibleBranches.includes("ALL")) {
                        return true;
                    }
                    // Check if there is an intersection between the job's eligible branches and college's active branches
                    const hasBranchOverlap = eligibleBranches.some((branch) => collegeBranches.includes(branch));
                    return hasBranchOverlap;
                });
            }
        }
        return jobs;
    }
}
exports.GetPendingJobsUseCase = GetPendingJobsUseCase;
