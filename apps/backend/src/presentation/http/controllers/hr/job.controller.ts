import { Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IPostJobUseCase } from "@application/usecases/hr/job-engine/PostJob.usecase";
import { IGetHRJobsUseCase } from "@application/usecases/hr/job-engine/GetHRJobs.usecase";
import { ICloseJobUseCase } from "@application/usecases/hr/job-engine/CloseJob.usecase";
import { IDeleteJobUseCase } from "@application/usecases/hr/job-engine/DeleteJob.usecase";
import { IGetHRCandidatesUseCase } from "@application/usecases/hr/job-engine/GetHRCandidates.usecase";
import { IUpdateJobUseCase } from "@application/usecases/hr/job-engine/UpdateJob.usecase";
import { JobStatus } from "@domain/enums/JobStatus.enum";

export class HRJobController {
  constructor(
    private readonly _postJobUseCase: IPostJobUseCase,
    private readonly _getHRJobsUseCase: IGetHRJobsUseCase,
    private readonly _closeJobUseCase: ICloseJobUseCase,
    private readonly _deleteJobUseCase: IDeleteJobUseCase,
    private readonly _getHRCandidatesUseCase: IGetHRCandidatesUseCase,
    private readonly _updateJobUseCase: IUpdateJobUseCase
  ) { }

  postJob = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const result = await this._postJobUseCase.execute(companyId, req.body);
    sendSuccess(res, result.toJSON(), "Job post created and submitted for approval successfully", HttpStatus.CREATED);
  });

  getJobs = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { status, query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getHRJobsUseCase.execute(
      companyId,
      {
        status: status as JobStatus,
        searchQuery: query as string
      },
      Number(page),
      Number(limit)
    );

    sendSuccess(
      res,
      {
        jobs: result.jobs.map((job) => job.toJSON()),
        total: result.total
      },
      "HR Jobs retrieved successfully"
    );
  });

  closeJob = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._closeJobUseCase.execute(companyId, jobId);
    sendSuccess(res, result.toJSON(), "Job closed successfully");
  });

  deleteJob = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._deleteJobUseCase.execute(companyId, jobId);
    sendSuccess(res, result.toJSON(), "Job post deleted successfully");
  });

  getCandidates = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const candidates = await this._getHRCandidatesUseCase.execute(companyId);
    sendSuccess(res, candidates, "Candidates list retrieved successfully");
  });
  updateJob = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._updateJobUseCase.execute(jobId, companyId, req.body);
    sendSuccess(res, result.toJSON(), "Job updated successfully", HttpStatus.OK);
  });
}
