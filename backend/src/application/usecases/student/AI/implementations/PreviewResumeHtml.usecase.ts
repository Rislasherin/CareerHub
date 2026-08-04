import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IResumeRepository } from '@domain/repositories/AI/IResumeRepository';
import { ResumeTemplateContext } from '@application/usecases/student/AI/templates/ResumeTemplateContext';
import { IPreviewResumeHtmlUseCase } from "../interfaces/IPreviewResumeHtml.usecase";
import { PreviewCacheService } from "@infrastructure/cache/PreviewCache.service";

export class PreviewResumeHtmlUseCase implements IPreviewResumeHtmlUseCase {
    private readonly _templateContext = new ResumeTemplateContext();
    constructor(private readonly _resumeRepository: IResumeRepository) { }

    async execute(resumeId: string, templateId: string = "professional"): Promise<string> {
        if (!resumeId) {
            throw new AppError("Resume ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }
        try {
            const resume = await this._resumeRepository.findById(resumeId);
            if (!resume) {
                return this._getEmptyStateHtml();
            }

            const cacheKey = `${resumeId}:${templateId}:${resume.lastSyncedAt ? new Date(resume.lastSyncedAt).getTime() : 0}`;

            const cachedHtml = PreviewCacheService.get(cacheKey);
            if (cachedHtml) {
                return cachedHtml;
            }

            const html = this._templateContext.generateHtml(templateId, resume as any);
            PreviewCacheService.set(cacheKey, html);
            return html;
        } catch (error: unknown) {
            // rethrow if it's already our custom error
            if (error instanceof AppError) throw error;
            // anything else (like bad mongo ID before first sync) just show the empty state
            return this._getEmptyStateHtml();
        }
    }


    private _getEmptyStateHtml(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container { text-align: center; padding: 48px 32px; max-width: 420px; }
        .icon { font-size: 64px; margin-bottom: 24px; }
        h2 { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
        p { font-size: 14px; color: #64748b; line-height: 1.7; }
        .badge {
            display: inline-block;
            margin-top: 24px;
            background: #e0e7ff;
            color: #4f46e5;
            font-size: 12px;
            font-weight: 700;
            padding: 8px 20px;
            border-radius: 100px;
            border: 1px solid #c7d2fe;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📄</div>
        <h2>Resume Not Synced Yet</h2>
        <p>Your profile data hasn't been synced to this resume version yet. Click <strong>Sync Profile</strong> in the Resume Builder to generate your live preview.</p>
        <div class="badge">↗ Click "Sync Profile" to get started</div>
    </div>
</body>
</html>`;
    }
}