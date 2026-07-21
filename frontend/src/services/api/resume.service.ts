import { apiClient } from './api.client';

export class ResumeService {
  /**
   * Sends the full resume data to get the ATS Score and AI Suggestions
   */
  static async analyzeResume() {
    // Assuming the backend extracts studentId from the auth token
    const response = await apiClient.post('/student/resume/analyze');
    return response.data;
  }

  /**
   * Sends a single bad bullet point to the AI to get a professional rewrite
   */
  static async autoFixText(text: string, targetRole: string) {
    const response = await apiClient.post('/student/resume/autofix', {
      text,
      targetRole
    });
    return response.data;
  }

  public static async syncProfileToResume(resumeId: string): Promise<any> {
    const response = await apiClient.post('/student/resume/sync', { resumeId });

    return response.data.data;
  }

  public static async updateSettings(resumeId: string, settings: any): Promise<any> {
    const response = await apiClient.patch('/student/resume/settings', { resumeId, settings });
    return response.data.data;
  }
}
