import { Request, Response } from "express";
import { AnalyzeResumeUseCase } from "@application/usecases/student/AI/implementations/AnalyzeResume.usecase";
import { asyncHandler } from "@shared/utils/asyncHandler.util";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { MESSAGES } from "@shared/constants/messages.constants";

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

    private _getStudentId(req: Request): string {
        const authUser = req.user as { id?: string; _id?: string } | undefined;
        const reqAuthUser = (req as unknown as { user?: { id?: string; _id?: string } }).user;
        const studentId = authUser?.id || authUser?._id || reqAuthUser?.id || reqAuthUser?._id;
        if (!studentId) {
            throw new AppError(MESSAGES.ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);
        }
        return studentId;
    }

    public analyze = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const atsReport = await this._analyzeResumeUseCase.execute(studentId);
        sendSuccess(res, atsReport, MESSAGES.SUCCESS.FETCHED, HttpStatus.OK);
    });

    public syncProfile = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const { resumeId } = req.body;
        const updatedResume = await this.__syncProfileToResumeUseCase.execute(studentId, resumeId);
        sendSuccess(res, updatedResume, MESSAGES.RESUME.SYNC_SUCCESS, HttpStatus.OK);
    });

    public updateSettings = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const { settings } = req.body;

        if (!settings) {
            throw new AppError(MESSAGES.RESUME.SETTINGS_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const updatedResume = await this.__updateResumeSettingsUseCase.execute(studentId, settings);
        sendSuccess(res, updatedResume.settings, MESSAGES.RESUME.SETTINGS_SAVED, HttpStatus.OK);
    });

    public exportPdf = asyncHandler(async (req: Request, res: Response) => {
        this._getStudentId(req);
        const resumeId = req.query.resumeId as string;
        
        if (!resumeId) {
            throw new AppError(MESSAGES.RESUME.RESUME_ID_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const pdfBuffer = await this._exportResumePdfUseCase.execute(resumeId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Resume.pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.end(pdfBuffer);
    });

    public previewHtml = asyncHandler(async (req: Request, res: Response) => {
        this._getStudentId(req);
        const resumeId = req.query.resumeId as string;
        if (!resumeId) {
            throw new AppError(MESSAGES.RESUME.RESUME_ID_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        const html = await this._previewHtmlUseCase.execute(resumeId, req.query.template as string);

        res.setHeader('Content-Type', 'text/html');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('X-Frame-Options');
        res.send(html);
    });

    public autoFix = asyncHandler(async (req: Request, res: Response) => {
        const { text, targetRole } = req.body;
        if (!text || !targetRole) {
            throw new AppError(MESSAGES.RESUME.TEXT_AND_ROLE_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        
        const fixedText = await this._autoFixTextUseCase.execute(text, targetRole);
        sendSuccess(res, { fixedText }, MESSAGES.RESUME.AUTOFIX_SUCCESS, HttpStatus.OK);
    });

    public rewriteAll = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const targetRole = req.body.targetRole || "Software Engineer";

        const updatedResume = await this._rewriteEntireResumeUseCase.execute(studentId, targetRole);
        sendSuccess(res, updatedResume, MESSAGES.RESUME.REWRITE_SUCCESS, HttpStatus.OK);
    });

    public getAll = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const resumes = await this._getResumesUseCase.execute(studentId);
        sendSuccess(res, resumes, MESSAGES.RESUME.FETCHED, HttpStatus.OK);
    });

    public create = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const { title } = req.body;
        const newResume = await this._createResumeUseCase.execute(studentId, title);
        sendSuccess(res, newResume, MESSAGES.RESUME.CREATED, HttpStatus.CREATED);
    });

    public matchJob = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const { resumeId, jobDescription } = req.body;
        
        if (!resumeId || !jobDescription) {
            throw new AppError(MESSAGES.RESUME.MATCH_PARAMS_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const report = await this._matchJobDescriptionUseCase.execute(resumeId, jobDescription);
        sendSuccess(res, report, MESSAGES.RESUME.JOB_MATCH_SUCCESS, HttpStatus.OK);
    });

    public coachSection = asyncHandler(async (req: Request, res: Response) => {
        const studentId = this._getStudentId(req);
        const { resumeId, sectionName, instructions, targetRole } = req.body;

        if (!resumeId || !sectionName || !instructions || !targetRole) {
            throw new AppError(MESSAGES.RESUME.COACH_PARAMS_REQUIRED, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        const result = await this._coachResumeSectionUseCase.execute(resumeId, sectionName, instructions, targetRole);
        sendSuccess(res, result, MESSAGES.RESUME.SECTION_COACH_SUCCESS, HttpStatus.OK);
    });
}