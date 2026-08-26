// frontend/src/services/student/interview.service.ts

import { apiClient } from '@/services/api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { ISessionStatusDTO, ISessionTokenDTO } from '@/types/ai-interview';

export interface IStudentInterviewService {
  startInterview(interviewId: string): Promise<{ success: boolean; phase: string; sessionId: string }>;
  getSessionToken(sessionId: string): Promise<ISessionTokenDTO>;
  getSessionStatus(sessionId: string): Promise<ISessionStatusDTO>;
}

class StudentInterviewServiceImpl implements IStudentInterviewService {
  async startInterview(interviewId: string): Promise<{ success: boolean; phase: string; sessionId: string }> {
    const response = await apiClient.post<{ success: boolean; phase: string; sessionId: string }>(
      `${API_ROUTES.STUDENT.INTERVIEWS}/${interviewId}/start`
    );
    return response.data;
  }

  async getSessionToken(sessionId: string): Promise<ISessionTokenDTO> {
    const response = await apiClient.get<ISessionTokenDTO>(`/student/interviews/session/${sessionId}/token`);
    return response.data;
  }

  async getSessionStatus(sessionId: string): Promise<ISessionStatusDTO> {
    const response = await apiClient.get<ISessionStatusDTO>(`/student/interviews/session/${sessionId}/status`);
    return response.data;
  }
}

export const StudentInterviewService: IStudentInterviewService = new StudentInterviewServiceImpl();
