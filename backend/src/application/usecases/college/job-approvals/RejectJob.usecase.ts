import { Job } from "@domain/entities/Job";
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IJobRepository } from "@domain/repositories/IJobRepository";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export interface IRejectJobUseCase {
  execute(collegeId: string, jobId: string, rejectionNote: string): Promise<Job>;
}

export class RejectJobUseCase implements IRejectJobUseCase {
  constructor(private readonly _jobRepository: IJobRepository) {}

  async execute(collegeId: string, jobId: string, rejectionNote: string): Promise<Job> {
    if (!rejectionNote || rejectionNote.trim() === "") {
      throw new AppError("Rejection note is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    const job = await this._jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
    }

    if (job.collegeId !== collegeId && job.collegeId !== "ALL") {
      throw new AppError("Unauthorized access to this job", HttpStatus.FORBIDDEN, ErrorCode.UNAUTHORIZED);
    }

    if (job.collegeId === "ALL") {
      if (job.rejectedColleges.includes(collegeId)) {
        throw new AppError("Job already rejected by your college", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      job.rejectForCollege(collegeId);
    } else {
      if (job.status !== JobStatus.PENDING_REVIEW) {
        throw new AppError("Job is not pending review", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
      }
      job.status = JobStatus.REJECTED;
      job.rejectionNote = rejectionNote;
      job.rejectForCollege(collegeId);
    }

    return await this._jobRepository.update(jobId, job);
  }
}
