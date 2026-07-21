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
import { IExportResumePdfUseCase } from "@application/usecases/student/AI/interfaces/IExportResumePdf.usecase";
import { IPreviewResumeHtmlUseCase } from "@application/usecases/student/AI/interfaces/IPreviewResumeHtml.usecase";
import { IAutoFixTextUseCase } from "@application/usecases/student/AI/interfaces/IAutoFixText.usecase";
import { IRewriteEntireResumeUseCase } from "@application/usecases/student/AI/interfaces/IRewriteEntireResume.usecase";
import { ICreateResumeUseCase } from "@application/usecases/student/AI/interfaces/ICreateResume.usecase";
import { IGetResumesUseCase } from "@application/usecases/student/AI/interfaces/IGetResumes.usecase";
import { IMatchJobDescriptionUseCase } from "@application/usecases/student/AI/interfaces/IMatchJobDescription.usecase";
import { ICoachResumeSectionUseCase } from "@application/usecases/student/AI/interfaces/ICoachResumeSection.usecase";

export class ResumeController {
    constructor(
        private readonly _analyzeResumeUseCase: AnalyzeResumeUseCase,
        private readonly __syncProfileToResumeUseCase: ISyncProfileToResumeUseCase,
        private readonly __updateResumeSettingsUseCase: IUpdateResumeSettingsUseCase,
        private readonly _exportResumePdfUseCase: IExportResumePdfUseCase,
        private readonly _previewHtmlUseCase: IPreviewResumeHtmlUseCase,
        private readonly _autoFixTextUseCase: IAutoFixTextUseCase,
        private readonly _rewriteEntireResumeUseCase: IRewriteEntireResumeUseCase,
        private readonly _createResumeUseCase: ICreateResumeUseCase,
        private readonly _getResumesUseCase: IGetResumesUseCase,
        private readonly _matchJobDescriptionUseCase: IMatchJobDescriptionUseCase,
        private readonly _coachResumeSectionUseCase: ICoachResumeSectionUseCase
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
        const { resumeId } = req.body;

        if (!studentId) {
            throw new AppError("Unauthorized", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        };

        const updatedResume = await this.__syncProfileToResumeUseCase.execute(studentId, resumeId);

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

    public exportPdf = asyncHandler(async(req: Request, res:Response) => {
        const studentId = (req as any).user?.id || (req as any).user?._id;
        const resumeId = req.query.resumeId as string;
        
        if (!studentId || !resumeId) {
            throw new AppError("resumeId is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const pdfBuffer = await this._exportResumePdfUseCase.execute(resumeId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Resume.pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.end(pdfBuffer);
    });

    previewHtml = asyncHandler(async(req:Request,res:Response) => {
        const studentId = req.user?.id
        const resumeId = req.query.resumeId as string;
        if(!studentId || !resumeId) {
            throw new AppError("resumeId is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        const html = await this._previewHtmlUseCase.execute(resumeId, req.query.template as string);

        res.setHeader('Content-Type', 'text/html')
        res.removeHeader('Content-Security-Policy')
        res.removeHeader('X-Frame-Options')
        res.send(html)
    });

    public autoFix = asyncHandler(async (req: Request, res: Response) => {
        const { text, targetRole } = req.body;
        if (!text || !targetRole) {
            throw new AppError("Text and targetRole are required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        
        const fixedText = await this._autoFixTextUseCase.execute(text, targetRole);
        
        sendSuccess(res, { fixedText }, "Text autofixed successfully", HttpStatus.OK);
    });

    public rewriteAll = asyncHandler(async (req: Request, res: Response) => {
        const studentId = req.user?.id;
        const targetRole = req.body.targetRole || "Software Engineer";

        if (!studentId) {
            throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }

        const updatedResume = await this._rewriteEntireResumeUseCase.execute(studentId, targetRole);

        sendSuccess(res, updatedResume, "Resume fully rewritten by AI", HttpStatus.OK);
    });

    public getAll = asyncHandler(async (req: Request, res: Response) => {
        const studentId = req.user?.id;
        if (!studentId) throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);

        const resumes = await this._getResumesUseCase.execute(studentId);
        sendSuccess(res, resumes, "Resumes fetched successfully", HttpStatus.OK);
    });

    public create = asyncHandler(async (req: Request, res: Response) => {
        const studentId = req.user?.id;
        const { title } = req.body;
        if (!studentId) throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);

        const newResume = await this._createResumeUseCase.execute(studentId, title);
        sendSuccess(res, newResume, "Resume created successfully", HttpStatus.CREATED);
    });

    public matchJob = asyncHandler(async (req: Request, res: Response) => {
        const studentId = req.user?.id;
        const { resumeId, jobDescription } = req.body;
        
        if (!studentId || !resumeId || !jobDescription) {
            throw new AppError("resumeId and jobDescription are required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const report = await this._matchJobDescriptionUseCase.execute(resumeId, jobDescription);
        sendSuccess(res, report, "Job matched successfully", HttpStatus.OK);
    });

    public coachSection = asyncHandler(async (req: Request, res: Response) => {
        const studentId = req.user?.id;
        const { resumeId, sectionName, instructions, targetRole } = req.body;

        if (!studentId || !resumeId || !sectionName || !instructions || !targetRole) {
            throw new AppError("resumeId, sectionName, instructions, and targetRole are required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const result = await this._coachResumeSectionUseCase.execute(resumeId, sectionName, instructions, targetRole);
        sendSuccess(res, result, "Section coached successfully", HttpStatus.OK);
    });
}