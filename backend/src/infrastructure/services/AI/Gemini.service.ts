import { IAIService, IAtsAnalysisResult, IJobMatchReport, ISectionCoachResult } from "@application/interfaces/IAIService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "@infrastructure/logger/logger";

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
            logger.warn("AI Quota Exceeded/API Key Invalid. Falling back to mock data.", error.message);
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
            logger.warn("AI Quota Exceeded/API Key Invalid. Falling back to mock data.", error.message);
            return "Spearheaded a cross-functional team of 5 engineers to deliver the project 2 weeks ahead of schedule, reducing cloud infrastructure costs by 40%. (Mock Fallback Result)";
        }
    }

    async coachSection(sectionName: string, sectionData: any, instructions: string, targetRole: string): Promise<ISectionCoachResult> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `
                You are an expert ATS Career Coach.
                Review the user's "${sectionName}" section for a ${targetRole} role.
                User instructions: ${instructions}
                Original Data: ${JSON.stringify(sectionData)}

                Return a strict JSON object:
                {
                    "suggestedData": <the identical JSON schema of the Original Data, but with optimized text, metrics, and action verbs>,
                    "explanation": "A 1-2 sentence explanation of what you changed and why it is better for ATS."
                }
            `;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText) as ISectionCoachResult;
        } catch (error: any) {
            logger.warn("AI Quota Exceeded for Section Coach. Falling back.", error.message);
            let fallbackData = sectionData;
            try {
                if (Array.isArray(sectionData)) {
                    if (sectionData.length === 0) {
                        fallbackData = [{
                            title: "Mock AI Entry",
                            company: "Tech Corp",
                            description: "Demonstrating how the AI suggests new entries when your list is empty."
                        }];
                    } else {
                        fallbackData = sectionData.map(item => {
                            if (typeof item === 'object' && item !== null) {
                                return { ...item, description: (item.description || item.summary || item.role || '') + " [Mock: Increased efficiency by 40%]" };
                            }
                            return item;
                        });
                    }
                }
            } catch(e) {}

            return {
                suggestedData: fallbackData,
                explanation: "Fallback: Gemini API quota exceeded. Applied mock changes to demonstrate the UI."
            };
        }
    }

    async extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<any> {
        try {
            const model = this.genAI.getGenerativeModel({
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            })

            const prompt = `
                You are an expert ATS Resume Parser. 
                Extract all relevant information from the provided resume document and return it in the following strict JSON schema.
                If a section is missing, return an empty array or null for that field. Do not invent data.
                Schema:
                {
                    "personalInfo": { "fullName": "", "email": "", "phone": "", "linkedinUrl": "", "githubUrl": "" },
                    "education": [{ "institution": "", "degree": "", "fieldOfStudy": "", "startDate": "", "endDate": "" }],
                    "experience": [{ "company": "", "title": "", "startDate": "", "endDate": "", "descriptionBullets": [""] }],
                    "skills": [""]
                }
            `;
            const documentPart = {
                inlineData: {
                    data: fileBuffer.toString("base64"),
                    mimeType: mimeType
                }
            };
            const result = await model.generateContent([prompt, documentPart]);
            let responseText = result.response.text();
            
            // Clean markdown if Gemini still returns it despite the generationConfig
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

            return JSON.parse(responseText);
        } catch (error) {
            logger.error("Gemini Extraction Error:", error);
            throw error;
        }
    }

    async rewriteEntireResume(resumeData: any, targetRole: string): Promise<any> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `
                You are an expert ATS Resume Writer and Career Coach.
                Take the provided resume JSON and optimize the bullet points in the "experience" and "projects" arrays.
                Use the STAR method (Situation, Task, Action, Result).
                Target the optimization towards a ${targetRole} role.
                DO NOT hallucinate companies, dates, or skills not implied by the original text.
                Return a strict JSON object that exactly matches the input structure but with optimized text.
                Original Resume JSON: ${JSON.stringify(resumeData)}
            `;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText);
        } catch (error: any) {
            console.warn("AI Quota Exceeded/API Key Invalid. Falling back to mock data.", error.message);
            const fallbackData = JSON.parse(JSON.stringify(resumeData));
            if (fallbackData.experience && fallbackData.experience.length > 0) {
                fallbackData.experience[0].bulletPoints.push("Optimized by AI (Fallback due to API Limits)");
            }
            return fallbackData;
        }
    }

    async matchJobDescription(resumeData: any, jobDescription: string): Promise<IJobMatchReport> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `
                You are an expert ATS System.
                Compare the provided resume data with the given job description.
                Identify exactly which technical skills, frameworks, or keywords present in the Job Description are missing from the Resume.
                Calculate a strict Match Percentage (0-100) based purely on hard skills and direct experience overlap.
                
                Job Description:
                ${jobDescription}

                Resume Data:
                ${JSON.stringify(resumeData)}

                Return a strict JSON object with this exact schema:
                {
                    "matchPercentage": number,
                    "matchedKeywords": ["string"],
                    "missingKeywords": ["string"]
                }
            `;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(responseText) as IJobMatchReport;
        } catch (error: any) {
            logger.warn("AI Quota Exceeded/API Key Invalid for JD Match. Falling back.", error.message);
            return {
                matchPercentage: 65,
                matchedKeywords: ["JavaScript", "React"],
                missingKeywords: ["Docker", "Kubernetes (Fallback Data)"]
            };
        }
    }

    async generateProfessionalSummary(profileData: any): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ 
                model: "gemini-2.0-flash",
                generationConfig: { responseMimeType: "application/json" }
            });
            const prompt = `
                You are an expert ATS Resume Writer and Career Coach.
                Write a highly professional, ATS-friendly summary (2-4 sentences max) for a student's resume based ONLY on their real profile data provided below.
                Do not use any fake data, do not invent skills, and do not use placeholders. 
                Focus on their degree, key skills, relevant projects, and any listed experience.
                Keep it concise, active, and impactful.
                
                Profile Data:
                ${JSON.stringify(profileData)}

                Return ONLY a strict JSON object with a single field "summary".
                Example format: {"summary": "Motivated Software Engineering student..."}
            `;
            const result = await model.generateContent(prompt);
            let responseText = result.response.text();
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(responseText);
            return json.summary;
        } catch (error: any) {
            logger.warn("AI Quota Exceeded/API Key Invalid for Summary Generation. Falling back.", error.message);
            return "Highly motivated student with a strong foundation in their field of study. Eager to apply academic knowledge and practical skills in a professional environment to contribute to team success and continue learning.";
        }
    }
}