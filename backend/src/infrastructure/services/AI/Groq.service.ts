import OpenAI from 'openai';
import { IAIService, IAtsAnalysisResult, IJobMatchReport, ISectionCoachResult } from "@application/interfaces/IAIService";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { logger } from "@infrastructure/logger/logger";
import { AIPromptRegistry } from "./prompts/AIPromptRegistry";

export class GroqService implements IAIService {
    private _client: OpenAI;

    constructor() {
        this._client = new OpenAI({
            apiKey: process.env.GROQ_API_KEY || 'gsk_free_key',
            baseURL: "https://api.groq.com/openai/v1"
        });
    }

    async analyzeResume(resumeData: unknown): Promise<IAtsAnalysisResult> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getAnalyzeResumePrompt("") },
                    { role: "user", content: JSON.stringify(resumeData) }
                ]
            });
            return JSON.parse(response.choices[0].message.content || '{}') as IAtsAnalysisResult;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] analyzeResume failed:", msg);
            throw new AppError("Groq AI Resume Analysis failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async autoFixText(text: string, instructions: string): Promise<string> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: AIPromptRegistry.getAutoFixTextSystemPrompt(instructions) },
                    { role: "user", content: text }
                ]
            });
            return response.choices[0].message.content || text;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] autoFixText failed:", msg);
            throw new AppError("Groq AI Text Auto-Fix failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<Record<string, unknown>> {
        const textContent = fileBuffer.toString('utf-8');
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getDocumentExtractSystemPrompt() },
                    { role: "user", content: textContent }
                ]
            });
            return JSON.parse(response.choices[0].message.content || '{}') as Record<string, unknown>;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] extractResumeFromDocument failed:", msg);
            throw new AppError("Groq AI Document Extraction failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async rewriteEntireResume(resumeData: unknown, targetRole: string): Promise<Record<string, unknown>> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getRewriteResumeSystemPrompt(targetRole) },
                    { role: "user", content: JSON.stringify(resumeData) }
                ]
            });
            const content = response.choices[0]?.message?.content;
            return JSON.parse(content || '{}') as Record<string, unknown>;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] rewriteEntireResume failed:", msg);
            throw new AppError("Groq AI Resume Rewrite failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async matchJobDescription(resumeData: unknown, jobDescription: string): Promise<IJobMatchReport> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getJobMatchSystemPrompt() },
                    { role: "user", content: `Job Description:\n${jobDescription}\n\nResume Data:\n${JSON.stringify(resumeData)}` }
                ]
            });
            return JSON.parse(response.choices[0].message.content || '{}') as IJobMatchReport;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] matchJobDescription failed:", msg);
            throw new AppError("Groq AI Job Description Match failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async coachSection(sectionName: string, sectionData: unknown, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getSectionCoachSystemPrompt(sectionName, targetRole, instructions) },
                    { role: "user", content: JSON.stringify(sectionData) }
                ]
            });
            return JSON.parse(response.choices[0].message.content || '{}') as ISectionCoachResult;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] coachSection failed:", msg);
            throw new AppError("Groq AI Section Coaching failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async generateProfessionalSummary(profileData: unknown): Promise<string> {
        try {
            const response = await this._client.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    { role: "system", content: AIPromptRegistry.getProfessionalSummarySystemPrompt() },
                    { role: "user", content: JSON.stringify(profileData) }
                ]
            });
            const json = JSON.parse(response.choices[0].message.content || '{}');
            return json.summary || '';
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("[Groq] generateProfessionalSummary failed:", msg);
            throw new AppError("Groq AI Summary Generation failed: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }
}
