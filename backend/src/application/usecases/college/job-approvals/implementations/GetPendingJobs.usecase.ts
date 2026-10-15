import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";
import { IGetPendingJobsUseCase } from "../interfaces/IGetPendingJobs.usecase";
import { BranchMatcher } from "@shared/utils/branchMatcher.util";

export class GetPendingJobsUseCase implements IGetPendingJobsUseCase {
  constructor(
    private readonly _jobRepository: IJobRepository,
    private readonly _organizationRepository: IOrganizationRepository
  ) {}

  async execute(collegeId: string, status: JobStatus = JobStatus.PENDING_REVIEW): Promise<Job[]> {
    const jobs = await this._jobRepository.findByCollegeIdAndStatus(collegeId, status);

    const now = new Date();
    const filteredJobs = jobs.filter((job) => {
      if (job.isDeleted) return false;
      if (job.status === JobStatus.CLOSED) return false;
      if (job.deadline && job.deadline.getTime() <= now.getTime()) return false;
      if (job.collegeId === "ALL") {
        if (job.approvedColleges.includes(collegeId)) return false;
        if (job.status !== JobStatus.PENDING_REVIEW) return false;
      }
      return true;
    });

    // Smart Branch Routing: For pending review queue, automatically filter out jobs 
    // that have eligible branches which do NOT overlap with the college's activeBranches.
    if (status === JobStatus.PENDING_REVIEW) {
      const organization = await this._organizationRepository.findById(collegeId);
      if (organization) {
        const collegeBranches = organization.activeBranches || [];
        return filteredJobs.filter((job) => {
          const eligibleBranches = job.eligibility?.eligibleBranches || [];
          if (eligibleBranches.length === 0 || eligibleBranches.includes("ALL")) {
            return true;
          }
          const hasBranchOverlap = eligibleBranches.some((hrBranch) => {
            return collegeBranches.some(colBranch => {
              return BranchMatcher.isBranchMatch(hrBranch, colBranch);
            });
          });
          return hasBranchOverlap;
        });
      }
    }

    return filteredJobs;
  }
}

