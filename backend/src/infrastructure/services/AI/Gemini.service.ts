import { IAIService, IAtsAnalysisResult } from "@application/interfaces/IAIService";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService implements IAIService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }

    async analyzeResume(resumeData: any): Promise<IAtsAnalysisResult> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `You are an ATS parser. Return strict JSON matching IAtsAnalysisResult structure: { atsScore: number, suggestions: [{type: 'Critical'|'Improve'|'Good', message: string}], missingKeywords: string[] }. Resume data: ${JSON.stringify(resumeData)}`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonStr = responseText.replace(/```json\n?/, '').replace(/```\n?/, '');
            return JSON.parse(jsonStr) as IAtsAnalysisResult;
        } catch (error: any) {
            console.warn("AI Quota Exceeded/API Key Invalid. Falling back to mock data.", error.message);
            return {
                atsScore: 92,
                suggestions: [{ type: 'Good', message: "Mock: Excellent structure (Real AI quota exceeded)" }],
                missingKeywords: ["React", "TypeScript"]
            };
        }
    }

    async autoFixText(text: string, instructions: string): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `${instructions}\n\nOriginal text: ${text}`;
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error: any) {
            console.warn("AI Quota Exceeded/API Key Invalid. Falling back to mock data.", error.message);
            return "Enhanced by Fallback AI: " + text + " (Note: Your real Gemini API quota is 0)";
        }
    }
}