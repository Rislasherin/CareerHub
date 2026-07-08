import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { MESSAGES } from "@shared/constants/messages.constants";
import { sendSuccess } from "@shared/utils/response.util";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IPostJobUseCase } from "@application/usecases/hr/job-engine/interfaces/IPostJob.usecase";;
import { IGetHRJobsUseCase } from "@application/usecases/hr/job-engine/interfaces/IGetHRJobs.usecase";;
import { ICloseJobUseCase } from "@application/usecases/hr/job-engine/interfaces/ICloseJob.usecase";;
import { IDeleteJobUseCase } from "@application/usecases/hr/job-engine/interfaces/IDeleteJob.usecase";;
import { IGetHRCandidatesUseCase } from "@application/usecases/hr/job-engine/interfaces/IGetHRCandidates.usecase";;
import { IUpdateJobUseCase } from "@application/usecases/hr/job-engine/interfaces/IUpdateJob.usecase";;
import { JobStatus } from "@domain/enums/JobStatus.enum";
import { IGetCandidateProfileUseCase } from "@application/usecases/hr/job-engine/interfaces/IGetCandidateProfile.usecase";
import { IGetHRJobApplicationsUseCase } from "@application/usecases/hr/job-engine/interfaces/IGetHRJobApplications.usecase";
import { IUpdateApplicationStatusUseCase } from "@application/usecases/hr/job-engine/interfaces/IUpdateApplicationStatus.usecase";
import { JobApplicationStatus } from "@domain/enums/JobApplicationStatus.enum";

export class HRJobController {
  constructor(
    private readonly _postJobUseCase: IPostJobUseCase,
    private readonly _getHRJobsUseCase: IGetHRJobsUseCase,
    private readonly _closeJobUseCase: ICloseJobUseCase,
    private readonly _deleteJobUseCase: IDeleteJobUseCase,
    private readonly _getHRCandidatesUseCase: IGetHRCandidatesUseCase,
    private readonly _updateJobUseCase: IUpdateJobUseCase,
    private readonly _getCandidateProfileUseCase: IGetCandidateProfileUseCase,
    private readonly _getHRJobApplicationsUseCase: IGetHRJobApplicationsUseCase,
    private readonly _updateApplicationStatusUseCase: IUpdateApplicationStatusUseCase
  ) {}

  postJob = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const result = await this._postJobUseCase.execute(companyId, req.body);
    sendSuccess(res, result.toJSON(), MESSAGES.SUCCESS.CREATED, HttpStatus.CREATED);
  });

  getJobs = asyncHandler(async (req: Request, res: Response) => {
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

  closeJob = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._closeJobUseCase.execute(companyId, jobId);
    sendSuccess(res, result.toJSON(), MESSAGES.SUCCESS.UPDATED);
  });

  deleteJob = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._deleteJobUseCase.execute(companyId, jobId);
    sendSuccess(res, result.toJSON(), MESSAGES.SUCCESS.DELETED);
  });

  getCandidates = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const candidates = await this._getHRCandidatesUseCase.execute(companyId);
    sendSuccess(res, candidates, MESSAGES.SUCCESS.FETCHED);
  });
  updateJob = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { jobId } = req.params;
    const result = await this._updateJobUseCase.execute(jobId, companyId, req.body);
    sendSuccess(res, result.toJSON(), MESSAGES.SUCCESS.UPDATED, HttpStatus.OK);
  });

  getCandidateProfile = asyncHandler(async(req:Request,res:Response)=>{
    const studentId = req.params.id;
    const profile = await this._getCandidateProfileUseCase.execute(studentId)

    sendSuccess(res,profile, MESSAGES.SUCCESS.FETCHED)
  })

  getJobApplications = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    
    const { jobId } = req.params;
    const applications = await this._getHRJobApplicationsUseCase.execute(jobId, companyId);
    sendSuccess(res, applications, MESSAGES.SUCCESS.FETCHED);
  });

  updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    
    const { id } = req.params; // applicationId
    const { status } = req.body;
    
    if (!status || !Object.values(JobApplicationStatus).includes(status)) {
      throw new AppError("Invalid status", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    }

    await this._updateApplicationStatusUseCase.execute(id, companyId, status);
    sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
  });

}
