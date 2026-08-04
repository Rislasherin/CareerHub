export interface IAtsAnalysisResult {
  atsScore: number;
  suggestions: { type: 'Critical' | 'Improve' | 'Good'; message: string }[];
  missingKeywords: string[];
}

export interface IJobMatchReport {
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface ISectionCoachResult {
  suggestedData: unknown;
  explanation: string;
}

export interface IAIService {
  analyzeResume(resumeData: unknown): Promise<IAtsAnalysisResult>;
  autoFixText(text: string, instructions: string): Promise<string>;
  coachSection(sectionName: string, sectionData: unknown, instructions: string, targetRole: string): Promise<ISectionCoachResult>;
  extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<Record<string, unknown>>;
  rewriteEntireResume(resumeData: unknown, targetRole: string): Promise<Record<string, unknown>>;
  matchJobDescription(resumeData: unknown, jobDescription: string): Promise<IJobMatchReport>;
  generateProfessionalSummary(profileData: unknown): Promise<string>;
}
