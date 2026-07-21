import { Request, Response } from "express";
import { AnalyzeResumeUseCase } from "@application/usecases/student/AI/implementations/AnalyzeResume.usecase";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { MESSAGES } from "@shared/constants/messages.constants";

import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { ISyncProfileToResumeUseCase } from "@application/usecases/student/AI/interfaces/ISyncProfileToResume.usecase";
import { IUpdateResumeSettingsUseCase } from "@application/usecases/student/AI/interfaces/IUpdateResumeSettings.usecase";

export class ResumeController {
    constructor(
        private readonly _analyzeResumeUseCase: AnalyzeResumeUseCase,
        private readonly __syncProfileToResumeUseCase: ISyncProfileToResumeUseCase,
        private readonly __updateResumeSettingsUseCase: IUpdateResumeSettingsUseCase,
    ) { }

    public analyze = asyncHandler(async (req: Request, res: Response) => {
        // Cast to any since Express Request might not have .user strongly typed depending on your custom type definitions
        const studentId = (req as any).user?.id || (req as any).user?._id;

        if (!studentId) {
            throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const atsReport = await this._analyzeResumeUseCase.execute(studentId);

        sendSuccess(res, atsReport, MESSAGES.SUCCESS.FETCHED, HttpStatus.OK);
    });

    public syncProfile = asyncHandler(async (req: Request, res: Response) => {

        const studentId = (req as any).user?.id || (req as any).user?._id;

        if (!studentId) {
            throw new AppError("Unauthorized", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        };

        const updatedResume = await this.__syncProfileToResumeUseCase.execute(studentId);

        sendSuccess(res, updatedResume, "Resume successfully synced with profile", HttpStatus.OK);

    })

    public updateSettings = asyncHandler(async (req: Request, res: Response) => {
        const studentId = (req as any).user?.id || (req as any).user?._id;
        const { settings } = req.body;

        if (!studentId || !settings) {
            throw new AppError("Invalid Request", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        // We use the new UseCase to apply partial settings updates
        const updatedResume = await this.__updateResumeSettingsUseCase.execute(studentId, settings);

        sendSuccess(res, updatedResume.settings, "Settings auto-saved successfully", HttpStatus.OK);
    });

}