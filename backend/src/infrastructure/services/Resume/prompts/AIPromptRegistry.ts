/**
 * AIPromptRegistry
 * Centralized repository for all AI prompts and template builders across the application.
 * Prevents hardcoding prompt text inside services, controllers, or use cases.
 */
export class AIPromptRegistry {
    static getAnalyzeResumePrompt(resumeText: string): string {
        return `You are an expert ATS (Applicant Tracking System) optimization engine.
Analyze the following resume and return ONLY a valid JSON object matching this exact schema:
{
  "atsScore": number (0-100),
  "suggestions": [
    { "type": "Critical" | "Improve" | "Good", "message": "string" }
  ],
  "missingKeywords": ["string"]
}

Resume Text:
${resumeText}`;
    }

    static getRewriteResumeSystemPrompt(targetRole: string): string {
        return `You are an expert ATS Resume Writer. Rewrite and optimize the existing summary, experience bullet points, and project descriptions for a ${targetRole} role using the STAR method (Action Verb + Context + Result Metric).
CRITICAL DIRECTIVE: Only optimize sections and entries that exist in the provided input JSON payload! If "experience" or "projects" in the input JSON has 0 items or is empty, you MUST return an empty array [] for that field! DO NOT invent, generate, or hallucinate fake companies (e.g. "ABC Corporation"), fake dates, or placeholder projects.
Return valid JSON matching: { "summary": "string", "experience": [{ "company": "string", "role": "string", "bulletPoints": ["string"] }], "projects": [{ "name": "string", "description": "string", "technologies": ["string"] }] }.`;
    }


    static getSectionCoachSystemPrompt(sectionName: string, targetRole: string, instructions?: string): string {
        const userInstruct = instructions ? ` User instructions: ${instructions}.` : "";
        return `You are an expert ATS Career Coach. Review section "${sectionName}" for a ${targetRole} role.${userInstruct} Return valid JSON with { "suggestedData": <updated schema>, "explanation": "1-2 sentence rationale" }.`;
    }

    static getJobMatchSystemPrompt(): string {
        return `You are an ATS matcher. Compare resume against JD and return JSON with { "matchPercentage": number, "matchedKeywords": ["string"], "missingKeywords": ["string"] }.`;
    }

    static getAutoFixTextSystemPrompt(instructions: string): string {
        return `You are an expert ATS Resume Editor. Improve the text using STAR method and strong action verbs. Additional instructions: ${instructions}. Return ONLY the updated text.`;
    }

    static getProfessionalSummarySystemPrompt(): string {
        return `You are an expert ATS Resume Writer generating a professional resume summary for the provided student profile.
CRITICAL REQUIREMENTS:
1. NEVER refer to the student by name or use third-person pronouns (he, she, they, his, her). This is the student's own resume summary.
2. NEVER write "X holds a degree..." or similar biography-style openings.
3. Use a concise, professional resume-summary style (first-person implied, without using "I").
4. Base the summary ONLY on the profile data provided.
5. NEVER invent education, skills, experience, projects, achievements, or technologies.
6. Prioritize actual skills, education, projects/experience, and career direction from the profile.
7. If the student is a fresher, naturally reflect that without making the summary sound generic.
8. Avoid generic AI phrases such as "eager to launch their career", "passionate professional", "results-driven individual", etc. unless genuinely supported by the profile.
9. Keep it around 50–80 words.
10. Return ONLY a valid JSON object matching this schema: { "summary": "..." }`;
    }

    static getDocumentExtractSystemPrompt(): string {
        return `You are an expert ATS Resume Parser. Extract resume details and return JSON matching: { personalInfo: { fullName: "", email: "", phone: "", linkedinUrl: "", githubUrl: "" }, education: [{ institution: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }], experience: [{ company: "", title: "", startDate: "", endDate: "", descriptionBullets: [""] }], skills: [""] }.`;
    }
}
