import { apiClient } from './api.client';

export class ResumeService {
  /**
   * Sends the full resume data to get the ATS Score and AI Suggestions
   */
  static async analyzeResume() {
    // Assuming the backend extracts studentId from the auth token
    const response = await apiClient.post('/student/resume/analyze');
    return (response as any).data;
  }

  /**
   * Sends a single bad bullet point to the AI to get a professional rewrite
   */
  static async autoFixText(text: string, targetRole: string) {
    const response = await apiClient.post('/student/resume/autofix', {
      text,
      targetRole
    });
    return (response as any).data;
  }

  public static async rewriteEntireResume(targetRole: string) {
    const response = await apiClient.post('/student/resume/rewrite-all', { targetRole });
    return (response as any).data;
  }

  public static async syncProfileToResume(resumeId: string): Promise<any> {
    const response = await apiClient.post('/student/resume/sync', { resumeId });
    return (response as any).data;
  }

  public static async updateSettings(resumeId: string, settings: any): Promise<any> {
    const response = await apiClient.patch('/student/resume/settings', { resumeId, settings });
    return (response as any).data;
  }

  public static async fetchAllResumes(): Promise<any[]> {
    const response = await apiClient.get('/student/resumes');
    return (response as any).data;
  }

  public static async createResume(title: string): Promise<any> {
    const response = await apiClient.post('/student/resumes', { title });
    return (response as any).data;
  }

  public static async matchJobDescription(resumeId: string, jobDescription: string): Promise<any> {
    const response = await apiClient.post('/student/resume/match-job', { resumeId, jobDescription });
    return (response as any).data;
  }

  public static async coachSection(resumeId: string, sectionName: string, instructions: string, targetRole: string): Promise<any> {
    const response = await apiClient.post('/student/resume/coach-section', { resumeId, sectionName, instructions, targetRole });
    return (response as any).data;
  }
}
