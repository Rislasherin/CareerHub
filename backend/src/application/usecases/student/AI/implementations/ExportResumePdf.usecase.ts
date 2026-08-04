import puppeteer from 'puppeteer';
import { IExportResumePdfUseCase } from "../interfaces/IExportResumePdf.usecase";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { IResumeRepository } from '@domain/repositories/AI/IResumeRepository';
import { ResumeTemplateContext } from '../templates/ResumeTemplateContext';
import { puppeteerPool } from "@infrastructure/services/pdf/PuppeteerPool";

export class ExportResumePdfUseCase implements IExportResumePdfUseCase {
    private readonly _templateContext = new ResumeTemplateContext();

    constructor(
        private readonly _resumeRepository: IResumeRepository) { }

    async execute(resumeId: string): Promise<Buffer> {
        if (!resumeId) {
            throw new AppError("Resume ID is required", HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
        }

        try {
            const resume = await this._resumeRepository.findById(resumeId);
            if (!resume) {
                throw new AppError("Resume not found", HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND);
            }
            
            const templateId = resume.settings?.templateId || "professional"; 
            
            const htmlContent = this._templateContext.generateHtml(templateId, resume as any);

            // use the pool so we're not spinning up a new browser every time
            const pdfBuffer = await puppeteerPool.execute(async (page) => {
                await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
                return await page.pdf({
                    format: 'A4',
                    printBackground: true,
                    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
                });
            });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            throw new AppError("Failed to generate PDF", HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR);
        }
    }
}
