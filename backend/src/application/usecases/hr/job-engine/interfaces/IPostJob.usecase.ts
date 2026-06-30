import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { PostJobDto } from "@application/dtos/hr/Request/PostJob.dto";

export interface IPostJobUseCase {
  execute(companyId: string, dto: PostJobDto): Promise<Job>;
}
