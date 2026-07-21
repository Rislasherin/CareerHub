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
  suggestedData: any;
  explanation: string;
}

export interface IAIService {
  analyzeResume(resumeData: any): Promise<IAtsAnalysisResult>;
  autoFixText(text: string, instructions: string): Promise<string>;
  coachSection(sectionName: string, sectionData: any, instructions: string, targetRole: string): Promise<ISectionCoachResult>;
  extractResumeFromDocument(fileBuffer: Buffer, mimeType: string): Promise<any>;
  rewriteEntireResume(resumeData: any, targetRole: string): Promise<any>;
  matchJobDescription(resumeData: any, jobDescription: string): Promise<IJobMatchReport>;
  generateProfessionalSummary(profileData: any): Promise<string>;
}
