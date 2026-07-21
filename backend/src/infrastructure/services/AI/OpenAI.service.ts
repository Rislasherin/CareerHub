import OpenAI from 'openai'
import { IAIService, IAtsAnalysisResult, IJobMatchReport, ISectionCoachResult } from "@application/interfaces/IAIService";

export class OpenAIService implements IAIService {
    private _openai: OpenAI
    constructor() {
        this._openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async analyzeResume(resumeData: any): Promise<IAtsAnalysisResult> {

        const response = await this._openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: {type:"json_object"},
            messages: [
                {role: "system",content: "You are an ATS parser. Return strict JSON matching IAtsAnalysisResult structure."},
                {role: "user", content: JSON.stringify(resumeData)}
            ]
        });
        return JSON.parse(response.choices[0].message.content || '{}') as IAtsAnalysisResult;
    }

    async autoFixText(text: string, instructions: string): Promise<string> {
        const response = await this._openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {role: "system", content: instructions},
                {role: "user", content: text}
            ]
        });
        return response.choices[0].message.content || text
    }

    async extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<any> {
        throw new Error("extractResumeFromDocument is not implemented for OpenAIService. Please use GeminiService for PDF parsing.");
    }

    async rewriteEntireResume(resumeData: any, targetRole: string): Promise<any> {
        throw new Error("rewriteEntireResume is not implemented for OpenAIService. Please use GeminiService.");
    }

    async matchJobDescription(resumeData: any, jobDescription: string): Promise<IJobMatchReport> {
        throw new Error("matchJobDescription is not implemented for OpenAIService. Please use GeminiService.");
    }

    async coachSection(sectionName: string, sectionData: any, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        throw new Error("coachSection is not implemented for OpenAIService. Please use GeminiService.");
    }

    async generateProfessionalSummary(profileData: any): Promise<string> {
        throw new Error("generateProfessionalSummary is not implemented for OpenAIService. Please use GeminiService.");
    }
}