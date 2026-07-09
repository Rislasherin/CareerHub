import { Request, Response } from "express";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetRescheduleRequestsUseCase } from "@application/usecases/hr/interview-management/interfaces/IGetRescheduleRequests.usecase";
import { IResolveRescheduleUseCase } from "@application/usecases/hr/interview-management/interfaces/IResolveReschedule.usecase";
import { IGetHRInterviewsUseCase } from "@application/usecases/hr/interview-management/implementations/GetHRInterviews.usecase";

export class HRInterviewController {
    constructor(
        private readonly _getHRInterviewsUseCase: IGetHRInterviewsUseCase,
        private readonly _getRescheduleRequestsUseCase: IGetRescheduleRequestsUseCase,
        private readonly _resolveRescheduleUseCase: IResolveRescheduleUseCase
    ) {}

    getInterviews = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const interviews = await this._getHRInterviewsUseCase.execute(companyId);
        sendSuccess(res, interviews, "Interviews retrieved successfully");
    });

    getRescheduleRequests = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const requests = await this._getRescheduleRequestsUseCase.execute(companyId);
        sendSuccess(res, requests, "Reschedule requests retrieved successfully");
    });

    resolveReschedule = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        const interviewId = req.params.id;
        const { approve, newDate, newTime } = req.body;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        await this._resolveRescheduleUseCase.execute({
            interviewId,
            companyId,
            approve,
            newDate,
            newTime
        });

        sendSuccess(res, null, `Reschedule request ${approve ? 'approved' : 'rejected'} successfully`);
    });
}
