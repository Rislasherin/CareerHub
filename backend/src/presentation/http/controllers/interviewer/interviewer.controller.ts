import { Request, Response } from "express";
import { AppError } from "@application/errors/AppError";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { IGetInterviewerScheduleUseCase } from "@application/usecases/interviewer/interfaces/IGetInterviewerSchedule.usecase";
import { IRequestInterviewRescheduleUseCase } from "@application/usecases/interviewer/interfaces/IRequestInterviewReschedule.usecase";

export class InterviewerController  {
    constructor(
        private readonly _getSheduleUseCase: IGetInterviewerScheduleUseCase,
        private readonly _requestRescheduleUseCase: IRequestInterviewRescheduleUseCase
    ){}

    getDashboard = asyncHandler(async (req:Request,res:Response) => {
        const interviewerId = req.user?.id

        if(!interviewerId) {
            throw new AppError("Interviewer ID not found in session", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }
        const schedule = await this._getSheduleUseCase.execute(interviewerId)
        sendSuccess(res, schedule, "Interviewer schedule retrieved successfully");
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

        sendSuccess(res, null, "Reschedule request submitted successfully to HR");
    });
}