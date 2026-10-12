import { Job } from "@domain/entities/Job";

export interface IPublishJobNowUseCase {
  execute(jobId: string, companyId: string): Promise<Job>;
}
