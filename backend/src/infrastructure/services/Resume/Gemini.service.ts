import { IAIService, IAtsAnalysisResult, IJobMatchReport, ISectionCoachResult } from "@application/interfaces/IAIService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Logger as logger } from "@infrastructure/logger/logger";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";
import { AIPromptRegistry } from "./prompts/AIPromptRegistry";

export class GeminiService implements IAIService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    async analyzeResume(resumeData: unknown): Promise<IAtsAnalysisResult> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
            const prompt = `${AIPromptRegistry.getAnalyzeResumePrompt("")}\nResume data: ${JSON.stringify(resumeData)}`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonStr = responseText.replace(/```json\n?/, '').replace(/```\n?/, '');
            return JSON.parse(jsonStr) as IAtsAnalysisResult;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in analyzeResume:", msg);
            throw new AppError("AI Resume Analysis service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async autoFixText(text: string, instructions: string): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
            const prompt = `${AIPromptRegistry.getAutoFixTextSystemPrompt(instructions)}\n\nOriginal text: ${text}`;
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in autoFixText:", msg);
            throw new AppError("AI Text Auto-Fix service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async coachSection(sectionName: string, sectionData: unknown, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-3.6-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `${AIPromptRegistry.getSectionCoachSystemPrompt(sectionName, targetRole, instructions)}\nOriginal Data: ${JSON.stringify(sectionData)}`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText) as ISectionCoachResult;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in coachSection:", msg);
            throw new AppError("AI Section Coaching service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<Record<string, unknown>> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-3.6-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = AIPromptRegistry.getDocumentExtractSystemPrompt();
            const documentPart = {
                inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType: mimeType
                }
            };
            const result = await model.generateContent([prompt, documentPart]);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(responseText) as Record<string, unknown>;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini Extraction Error:", msg);
            throw new AppError("Failed to extract content from resume document using AI.", HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async rewriteEntireResume(resumeData: unknown, targetRole: string): Promise<Record<string, unknown>> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-3.6-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `${AIPromptRegistry.getRewriteResumeSystemPrompt(targetRole)}\nOriginal Resume JSON: ${JSON.stringify(resumeData)}`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText) as Record<string, unknown>;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in rewriteEntireResume:", msg);
            throw new AppError("AI Resume Rewrite service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async matchJobDescription(resumeData: unknown, jobDescription: string): Promise<IJobMatchReport> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-3.6-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `${AIPromptRegistry.getJobMatchSystemPrompt()}\nJob Description:\n${jobDescription}\n\nResume Data:\n${JSON.stringify(resumeData)}`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText) as IJobMatchReport;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in matchJobDescription:", msg);
            throw new AppError("AI Job Matching service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }

    async generateProfessionalSummary(profileData: unknown): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-3.6-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `${AIPromptRegistry.getProfessionalSummarySystemPrompt()}\nProfile Data:\n${JSON.stringify(profileData)}`;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(responseText);
            return json.summary || '';
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error("Gemini API Error in generateProfessionalSummary:", msg);
            throw new AppError("AI Summary Generation service error: " + msg, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.INTERNAL_ERROR);
        }
    }
}