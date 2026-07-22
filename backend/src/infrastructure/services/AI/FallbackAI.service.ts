import { IAIService, IAtsAnalysisResult, IJobMatchReport, ISectionCoachResult } from "@application/interfaces/IAIService";
import { logger } from "@infrastructure/logger/logger";

export class FallbackAIService implements IAIService {
    constructor(
        private readonly primaryService: IAIService,
        private readonly fallbackService: IAIService
    ) {}

    private async executeWithFallback<T>(operationName: string, fn: (service: IAIService) => Promise<T>): Promise<T> {
        try {
            return await fn(this.primaryService);
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.warn(`[AIService] Primary AI provider operation '${operationName}' failed (${errMsg}). Attempting secondary provider...`);
            try {
                return await fn(this.fallbackService);
            } catch (fallbackError: unknown) {
                logger.error(`[AIService] Secondary AI provider operation '${operationName}' also failed. Propagating authentic exception.`);
                throw fallbackError;
            }
        }
    }

    async analyzeResume(resumeData: unknown): Promise<IAtsAnalysisResult> {
        return this.executeWithFallback('analyzeResume', s => s.analyzeResume(resumeData));
    }

    async autoFixText(text: string, instructions: string): Promise<string> {
        return this.executeWithFallback('autoFixText', s => s.autoFixText(text, instructions));
    }

    async coachSection(sectionName: string, sectionData: unknown, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        return this.executeWithFallback('coachSection', s => s.coachSection(sectionName, sectionData, instructions, targetRole));
    }

    async extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<Record<string, unknown>> {
        return this.executeWithFallback('extractResumeFromDocument', s => s.extractResumeFromDocument(fileBuffer, mimeType));
    }

    async rewriteEntireResume(resumeData: unknown, targetRole: string): Promise<Record<string, unknown>> {
        return this.executeWithFallback('rewriteEntireResume', s => s.rewriteEntireResume(resumeData, targetRole));
    }

    async matchJobDescription(resumeData: unknown, jobDescription: string): Promise<IJobMatchReport> {
        return this.executeWithFallback('matchJobDescription', s => s.matchJobDescription(resumeData, jobDescription));
    }

    async generateProfessionalSummary(profileData: unknown): Promise<string> {
        return this.executeWithFallback('generateProfessionalSummary', s => s.generateProfessionalSummary(profileData));
    }
}
