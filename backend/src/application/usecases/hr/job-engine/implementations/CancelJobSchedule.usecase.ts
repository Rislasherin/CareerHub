import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { ICancelJobScheduleUseCase } from "../interfaces/ICancelJobSchedule.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class CancelJobScheduleUseCase implements ICancelJobScheduleUseCase {
  constructor(private readonly _jobRepository: IJobRepository) {}

  async execute(jobId: string, companyId: string): Promise<Job> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.companyId !== companyId) {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.status !== JobStatus.SCHEDULED) {
      throw new AppError("Only scheduled jobs can have their schedule cancelled", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    job.cancelSchedule();

    const updatedJob = await this._jobRepository.update(jobId, job);
    if (!updatedJob) {
      throw new AppError("Failed to cancel job schedule", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    return updatedJob;
  }
}
