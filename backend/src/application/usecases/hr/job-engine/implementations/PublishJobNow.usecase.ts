import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { IPublishJobNowUseCase } from "../interfaces/IPublishJobNow.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class PublishJobNowUseCase implements IPublishJobNowUseCase {
  constructor(private readonly _jobRepository: IJobRepository) {}

  async execute(jobId: string, companyId: string): Promise<Job> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.companyId !== companyId) {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.status !== JobStatus.DRAFT && job.status !== JobStatus.SCHEDULED) {
      throw new AppError("Only drafts or scheduled jobs can be submitted for publication now", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    // Validate required publication fields
    if (!job.title || !job.title.trim()) {
      throw new AppError("Job title is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!job.category || !job.category.trim()) {
      throw new AppError("Job category is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!job.openings || job.openings < 1) {
      throw new AppError("Number of openings must be at least 1", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (!job.deadline) {
      throw new AppError("Application deadline is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const deadlineDate = new Date(job.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new AppError("Invalid application deadline date", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }
    if (deadlineDate.getTime() <= Date.now()) {
      throw new AppError("Application deadline must be in the future to publish", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    job.publishNow();

    const updatedJob = await this._jobRepository.update(jobId, job);
    if (!updatedJob) {
      throw new AppError("Failed to publish job", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
    }

    return updatedJob;
  }
}
