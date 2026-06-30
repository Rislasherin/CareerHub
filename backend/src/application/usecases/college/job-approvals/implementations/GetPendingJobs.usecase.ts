import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IGetPendingJobsUseCase } from "../interfaces/IGetPendingJobs.usecase";

export class GetPendingJobsUseCase implements IGetPendingJobsUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(collegeId: string, status: JobStatus = JobStatus.PENDING_REVIEW): Promise<Job[]> {
    const jobs = await this._jobRepository.findByCollegeIdAndStatus(collegeId, status);

    // Smart Branch Routing: For pending review queue, automatically filter out jobs 
    // that have eligible branches which do NOT overlap with the college's activeBranches.
    if (status === JobStatus.PENDING_REVIEW) {
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
          const hasBranchOverlap = eligibleBranches.some((branch) => {
            const hrBranch = branch.toLowerCase().trim();
            return collegeBranches.some(cb => {
              const colBranch = cb.toLowerCase().trim();
              return hrBranch.includes(colBranch) || colBranch.includes(hrBranch);
            });
          });
          return hasBranchOverlap;
        });
      }
    }

    return jobs;
  }
}

