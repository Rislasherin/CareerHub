import { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetHRDashboardStatsUseCase } from "@application/usecases/hr/dashboard/interfaces/IGetHRDashboardStats.usecase";;
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class HRDashboardController {
  constructor(private readonly _getStatsUseCase: IGetHRDashboardStatsUseCase) { }

  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError("Company ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
    }

    const result = await this._getStatsUseCase.execute(companyId);
    sendSuccess(res, result, "HR Dashboard stats retrieved successfully");
  });
}
