import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IAddInterviewerUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IAddInterviewer.usecase";;
import { IGetInterviewersUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IGetInterviewers.usecase";;
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { IToggleInterviewerStatusUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IToggleInterviewerStatus.usecase";;
import { IResendInterviewerInviteUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IResendInterviewerInvite.usecase";
import { IUpdateInterviewerUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IUpdateInterviewer.usecase";;
import { IDeleteInterviewerUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IDeleteInterviewer.usecase";;
import { IRestoreInterviewerUseCase } from "@application/usecases/hr/interviewer-management/interfaces/IRestoreInterviewer.usecase";;

export class InterviewerManagementController {
  constructor(
    private readonly _addUseCase: IAddInterviewerUseCase,
    private readonly _getUseCase: IGetInterviewersUseCase,
    private readonly _toggleUseCase: IToggleInterviewerStatusUseCase,
    private readonly _resendUseCase: IResendInterviewerInviteUseCase,
    private readonly _updateUseCase: IUpdateInterviewerUseCase,
    private readonly _deleteUseCase: IDeleteInterviewerUseCase,
    private readonly _restoreUseCase: IRestoreInterviewerUseCase
  ) { }

  addInterviewer = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { firstName, lastName, email } = req.body;
    await this._addUseCase.execute(companyId, firstName, lastName, email);
    sendSuccess(res, null, "Interviewer added and setup email sent successfully", HttpStatus.CREATED);
  });

  getInterviewers = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { query = "", page = 1, limit = 10, includeDeleted = "false" } = req.query;
    const result = await this._getUseCase.execute(
      companyId,
      query as string,
      Number(page),
      Number(limit),
      includeDeleted === "true"
    );
    sendSuccess(res, result, "Interviewers retrieved successfully");
  });

  toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { interviewerId } = req.params;
    await this._toggleUseCase.execute(interviewerId, companyId);
    sendSuccess(res, null, "Interviewer status updated successfully");
  });

  resendInvite = asyncHandler(async (req: Request, res: Response) => {
    const { interviewerId } = req.params;
    await this._resendUseCase.execute(interviewerId);
    sendSuccess(res, null, "Invitation link resent successfully");
  });

  updateInterviewer = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { interviewerId } = req.params;
    const { firstName, lastName, designation, specialization } = req.body;
    await this._updateUseCase.execute(companyId, interviewerId, {
      firstName,
      lastName,
      designation,
      specialization,
    });
    sendSuccess(res, null, "Interviewer updated successfully");
  });

  deleteInterviewer = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { interviewerId } = req.params;
    await this._deleteUseCase.execute(companyId, interviewerId);
    sendSuccess(res, null, "Interviewer removed successfully");
  });

  restoreInterviewer = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { interviewerId } = req.params;
    await this._restoreUseCase.execute(companyId, interviewerId);
    sendSuccess(res, null, "Interviewer restored successfully");
  });
}
