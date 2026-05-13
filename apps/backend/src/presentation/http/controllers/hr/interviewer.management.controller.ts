import { Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IAddInterviewerUseCase } from "@application/usecases/hr/interviewer-management/AddInterviewer.usecase";
import { IGetInterviewersUseCase } from "@application/usecases/hr/interviewer-management/GetInterviewers.usecase";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

import { IToggleInterviewerStatusUseCase } from "@application/usecases/hr/interviewer-management/ToggleInterviewerStatus.usecase";
import { ResendInterviewerInviteUseCase } from "@application/usecases/hr/interviewer-management/ResendInterviewerInvite.usecase";

export class InterviewerManagementController {
  constructor(
    private readonly _addUseCase: IAddInterviewerUseCase,
    private readonly _getUseCase: IGetInterviewersUseCase,
    private readonly _toggleUseCase: IToggleInterviewerStatusUseCase,
    private readonly _resendUseCase: ResendInterviewerInviteUseCase
  ) {}

  addInterviewer = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { firstName, lastName, email } = req.body;
    await this._addUseCase.execute(companyId, firstName, lastName, email);
    sendSuccess(res, null, "Interviewer added and setup email sent successfully", HttpStatus.CREATED);
  });

  getInterviewers = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { query = "", page = 1, limit = 10 } = req.query;
    const result = await this._getUseCase.execute(
      companyId,
      query as string,
      Number(page),
      Number(limit)
    );
    sendSuccess(res, result, "Interviewers retrieved successfully");
  });

  toggleStatus = asyncHandler(async (req: any, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }
    const { interviewerId } = req.params;
    await this._toggleUseCase.execute(interviewerId, companyId);
    sendSuccess(res, null, "Interviewer status updated successfully");
  });

  resendInvite = asyncHandler(async (req: any, res: Response) => {
    const { interviewerId } = req.params;
    await this._resendUseCase.execute(interviewerId);
    sendSuccess(res, null, "Invitation link resent successfully");
  });
}
