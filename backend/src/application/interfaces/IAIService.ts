export interface IAtsAnalysisResult {
  atsScore: number;
  suggestions: { type: 'Critical' | 'Improve' | 'Good'; message: string }[];
  missingKeywords: string[];
}

export interface IAIService {
  analyzeResume(resumeData: any): Promise<IAtsAnalysisResult>;
  autoFixText(text: string, instructions: string): Promise<string>;
}
