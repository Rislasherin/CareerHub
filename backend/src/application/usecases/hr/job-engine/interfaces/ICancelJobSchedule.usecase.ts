import { Job } from "@domain/entities/Job";

export interface ICancelJobScheduleUseCase {
  execute(jobId: string, companyId: string): Promise<Job>;
}
