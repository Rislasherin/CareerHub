import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IApproveJobUseCase } from "../interfaces/IApproveJob.usecase";

export class ApproveJobUseCase implements IApproveJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) {}

  async execute(collegeId: string, jobId: string): Promise<Job> {
    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.collegeId !== collegeId && job.collegeId !== "ALL") {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.collegeId === "ALL") {
      if (job.approvedColleges.includes(collegeId)) {
        throw new AppError("Job already approved by your college", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      job.approveForCollege(collegeId);
    } else {
      if (job.status !== JobStatus.PENDING_REVIEW) {
        throw new AppError("Job is not pending review", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      job.status = JobStatus.APPROVED;
      job.approveForCollege(collegeId);
    }

    return await this._jobRepository.update(jobId, job);
  }
}

