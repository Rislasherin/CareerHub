import { Request, Response } from "express";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetRescheduleRequestsUseCase } from "@application/usecases/hr/interview-management/interfaces/IGetRescheduleRequests.usecase";
import { IResolveRescheduleUseCase } from "@application/usecases/hr/interview-management/interfaces/IResolveReschedule.usecase";
import { IGetHRInterviewsUseCase } from "@application/usecases/hr/interview-management/implementations/GetHRInterviews.usecase";
import { IApproveCancellationUseCase } from "@application/usecases/hr/interview-management/implementations/ApproveCancellation.usecase";
import { IReassignInterviewerUseCase } from "@application/usecases/hr/interview-management/implementations/ReassignInterviewer.usecase";
import { MESSAGES } from "@shared/constants/messages.constants";

export class HRInterviewController {
    constructor(
        private readonly _getHRInterviewsUseCase: IGetHRInterviewsUseCase,
        private readonly _getRescheduleRequestsUseCase: IGetRescheduleRequestsUseCase,
        private readonly _resolveRescheduleUseCase: IResolveRescheduleUseCase,
        private readonly _approveCancellationUseCase: IApproveCancellationUseCase,
        private readonly _reassignInterviewerUseCase: IReassignInterviewerUseCase
    ) {}

    getInterviews = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const interviews = await this._getHRInterviewsUseCase.execute(companyId, page, limit);
        sendSuccess(res, interviews, MESSAGES.SUCCESS.INTERVIEWS_RETRIEVED);
    });

    getRescheduleRequests = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const requests = await this._getRescheduleRequestsUseCase.execute(companyId);
        sendSuccess(res, requests, MESSAGES.SUCCESS.RESCHEDULE_REQUESTS_RETRIEVED);
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

    approveCancellation = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        const interviewId = req.params.id;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        await this._approveCancellationUseCase.execute(companyId, interviewId);
        sendSuccess(res, null, "Interview cancellation approved. Student has been notified.");
    });

    reassignInterviewer = asyncHandler(async (req: Request, res: Response) => {
        const companyId = req.user?.companyId;
        const interviewId = req.params.id;
        const { newInterviewerId, newScheduledAt } = req.body;

        if (!companyId) {
            throw new AppError("Company ID not found", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        if (!newInterviewerId) {
            throw new AppError("New interviewer ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const newInterview = await this._reassignInterviewerUseCase.execute({
            companyId,
            interviewId,
            newInterviewerId,
            newScheduledAt: newScheduledAt ? new Date(newScheduledAt) : undefined
        });

        sendSuccess(res, newInterview, "Interview reassigned successfully. Interviewer and student have been notified.");
    });
}
