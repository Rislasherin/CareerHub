import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IOrganizationRepository } from "@domain/repositories/IOrganizationRepository";

export interface IGetPendingJobsUseCase {
  execute(collegeId: string, status?: JobStatus): Promise<Job[]>;
}
