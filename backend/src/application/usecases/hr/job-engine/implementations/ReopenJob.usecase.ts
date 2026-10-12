import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IReopenJobUseCase } from "../interfaces/IReopenJob.usecase";

export class ReopenJobUseCase implements IReopenJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(companyId: string, jobId: string, newDeadline?: Date): Promise<Job> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.companyId !== companyId) {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.isDeleted) {
      throw new AppError("Cannot reopen a deleted job", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    if (job.status !== JobStatus.CLOSED) {
      throw new AppError("Only closed jobs can be reopened", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const effectiveDeadline = newDeadline ? new Date(newDeadline) : new Date(job.deadline);
    const endOfDay = new Date(effectiveDeadline);
    if (endOfDay.getUTCHours() === 0 && endOfDay.getUTCMinutes() === 0 && endOfDay.getUTCSeconds() === 0) {
      endOfDay.setUTCHours(23, 59, 59, 999);
    }

    if (Date.now() > endOfDay.getTime()) {
      throw new AppError(
        "Cannot reopen job with an expired deadline. Please provide a future deadline.",
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_ERROR
      );
    }

    job.reopen(newDeadline);

    return await this._jobRepository.update(jobId, job);
  }
}
