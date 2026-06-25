import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IBaseRepository } from "./IBaseRepository";

export interface IJobRepository extends IBaseRepository<Job> {
  findByCompanyId(companyId: string): Promise<Job[]>;
  findByCollegeIdAndStatus(collegeId: string, status: JobStatus): Promise<Job[]>;
  searchJobs(
    filters: {
      collegeId?: string;
      companyId?: string;
      status?: JobStatus;
      searchQuery?: string;
    },
    page: number,
    limit: number
  ): Promise<{ jobs: Job[]; total: number }>;


}
