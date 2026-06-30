import { Job } from "@domain/entities/Job";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto } from "@application/dtos/hr/Request/PostJob.dto";

export interface IUpdateJobUseCase {
  execute(jobId: string, companyId: string, dto: PostJobDto): Promise<Job>;
}
