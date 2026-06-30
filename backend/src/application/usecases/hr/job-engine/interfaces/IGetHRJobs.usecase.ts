import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";

export interface IGetHRJobsUseCase {
  execute(
    companyId: string,
    filters: {
      status?: JobStatus;
      searchQuery?: string;
    },
    page: number,
    limit: number
  ): Promise<{ jobs: Job[]; total: number }>;
}
