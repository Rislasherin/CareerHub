import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { ScheduleInterviewUseCase } from "@application/usecases/hr/interview/ScheduleInterview.usecase";
import { GetHRInterviewsUseCase } from "@application/usecases/hr/interview/GetHRInterviews.usecase";
import { MESSAGES } from "@shared/constants/messages.constants";
import { SheduleInterviewDto } from "@application/dtos/hr/Request/ScheduleInterview.dto";

export class HRInterviewController {
  constructor(
    private readonly _scheduleInterviewUseCase: ScheduleInterviewUseCase,
    private readonly _getHRInterviewsUseCase: GetHRInterviewsUseCase
  ) {}

  scheduleInterview = asyncHandler(async (req: Request, res: Response) => {
    const hrId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!hrId || !companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const payload = req.body as SheduleInterviewDto;
    const interview = await this._scheduleInterviewUseCase.execute(hrId, companyId, payload);
    
    sendSuccess(res, interview, "Interview scheduled successfully");
  });

  getInterviews = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const interviews = await this._getHRInterviewsUseCase.execute(companyId);
    
    // We optionally populate related entities like applicant and job depending on how the frontend expects it, 
    // but the `IInterviewRepository.findByCompanyId` in mongoose usually populates candidate and job automatically.
    sendSuccess(res, interviews, "Interviews retrieved successfully");
  });
}
