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

export class GetHRJobsUseCase implements IGetHRJobsUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(
    companyId: string,
    filters: {
      status?: JobStatus;
      searchQuery?: string;
    },
    page: number,
    limit: number
  ): Promise<{ jobs: Job[]; total: number }> {
    return await this._jobRepository.searchJobs(
      {
        companyId,
        status: filters.status,
        searchQuery: filters.searchQuery
      },
      page,
      limit
    );
  }
}
