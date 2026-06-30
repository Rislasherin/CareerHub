import { Job } from "@domain/entities/Job";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IDeleteJobUseCase } from "../interfaces/IDeleteJob.usecase";

export class DeleteJobUseCase implements IDeleteJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) { }

  async execute(companyId: string, jobId: string): Promise<Job> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.companyId !== companyId) {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.isDeleted) {
      throw new AppError("Job is already deleted", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    job.delete();

    return await this._jobRepository.update(jobId, job);
  }
}

