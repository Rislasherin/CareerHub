import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IGetPendingJobsUseCase } from "@application/usecases/college/job-approvals/GetPendingJobs.usecase";
import { IApproveJobUseCase } from "@application/usecases/college/job-approvals/ApproveJob.usecase";
import { IRejectJobUseCase } from "@application/usecases/college/job-approvals/RejectJob.usecase";
import { JobStatus } from "@domain/enums/JobStatus.enum";

export class CollegeJobApprovalController {
  constructor(
    private readonly _getPendingJobsUseCase: IGetPendingJobsUseCase,
    private readonly _approveJobUseCase: IApproveJobUseCase,
    private readonly _rejectUseCase: IRejectJobUseCase
  ) { }

  getPendingJobs = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const status = req.query.status as JobStatus || JobStatus.PENDING_REVIEW;
    const result = await this._getPendingJobsUseCase.execute(orgId, status);
    sendSuccess(res, result.map((job) => job.toJSON()), "Jobs retrieved successfully");
  });

  approveJob = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._approveJobUseCase.execute(orgId, jobId);
    sendSuccess(res, result.toJSON(), "Job approved successfully");
  });

  rejectJob = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user?.orgId;
    if (!orgId) {
      throw new AppError("Organization ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const { reason } = req.body;
    const result = await this._rejectUseCase.execute(orgId, jobId, reason);
    sendSuccess(res, result.toJSON(), "Job rejected successfully");
  });
}
