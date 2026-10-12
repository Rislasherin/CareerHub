import { Job } from "@domain/entities/Job";

export interface IReopenJobUseCase {
  execute(companyId: string, jobId: string, newDeadline?: Date): Promise<Job>;
}
