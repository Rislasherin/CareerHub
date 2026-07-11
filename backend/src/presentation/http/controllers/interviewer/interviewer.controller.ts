import { request, Request, Response } from "express";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetInterviewerScheduleUseCase } from "@application/usecases/interviewer/interfaces/IGetInterviewerSchedule.usecase";
import { IRequestInterviewRescheduleUseCase } from "@application/usecases/interviewer/interfaces/IRequestInterviewReschedule.usecase";
import { MESSAGES } from "@shared/constants/messages.constants";
import { SubmitFeedbackDto } from "@application/dtos/interviewer/SubmitFeedback.dto";
import { ISubmitInterviewFeedbackUseCase } from "@application/usecases/interviewer/interfaces/ISubmitInterviewFeedback.usecase";
import { ICancelInterviewUseCase } from "@application/usecases/interviewer/interfaces/ICancelInterview.usecase";

export class InterviewerController  {
    constructor(
        private readonly _getSheduleUseCase: IGetInterviewerScheduleUseCase,
        private readonly _requestRescheduleUseCase: IRequestInterviewRescheduleUseCase,
        private readonly __submitInterviewFeedbackUseCase: ISubmitInterviewFeedbackUseCase,
        private readonly _cancelInterviewUseCase: ICancelInterviewUseCase
    ){}

    getDashboard = asyncHandler(async (req:Request,res:Response) => {
        const interviewerId = req.user?.id

        if(!interviewerId) {
            throw new AppError("Interviewer ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }
        const schedule = await this._getSheduleUseCase.execute(interviewerId)
        sendSuccess(res, schedule, MESSAGES.SUCCESS.INTERVIEWER_SCHEDULE_RETRIEVED);
    });

    requestReschedule = asyncHandler(async (req: Request, res: Response) => {
        const interviewerId = req.user?.id;
        const interviewId = req.params.id;
        const { reason, preferredDate, preferredTime, noteToHr } = req.body;

        if (!interviewerId) {
            throw new AppError("Interviewer ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        await this._requestRescheduleUseCase.execute({
            interviewId,
            interviewerId,
            reason,
            preferredDate,
            preferredTime,
            noteToHr
        });

        sendSuccess(res, null, MESSAGES.SUCCESS.RESCHEDULE_REQUEST_SUBMITTED);
    });

    submitFeedback = asyncHandler(async(req:Request, res:Response) => {
        const interviewerId = req.user?.id;
        const interviewId = req.params.id;

        if(!interviewerId) {
            throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const data: SubmitFeedbackDto = req.body;
        const interview = await this.__submitInterviewFeedbackUseCase.execute(interviewerId, interviewId, data);
        sendSuccess(res, interview, MESSAGES.SUCCESS.FEEDBACK_SUBMITTED);
    })

    cancelInterview = asyncHandler(async (req: Request, res: Response) => {
        const interviewerId = req.user?.id;
        const interviewId = req.params.id;
        const { reason } = req.body;

        if (!interviewerId) {
            throw new AppError("Interviewer ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        if (!reason) {
            throw new AppError("Cancellation reason is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const interview = await this._cancelInterviewUseCase.execute(interviewerId, interviewId, reason);
        sendSuccess(res, interview, "Interview cancelled successfully");
    });
}
