import { apiClient } from '../api/api.client';
import { API_ROUTES } from '@/constants/api.routes';
import { IAIInterviewEvaluation, IRecordHRDecisionPayload } from '@/types/ai-interview-evaluation';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const InterviewEvaluationService = {
  getEvaluation: async (interviewId: string): Promise<IAIInterviewEvaluation | null> => {
    const response = await apiClient.get(
      `${API_ROUTES.HR.INTERVIEWS}/${interviewId}/evaluation`
    ) as ApiResponse<IAIInterviewEvaluation | null>;
    return response.data ?? null;
  },

  recordDecision: async (
    interviewId: string,
    payload: IRecordHRDecisionPayload
  ): Promise<IAIInterviewEvaluation> => {
    const response = await apiClient.post(
      `${API_ROUTES.HR.INTERVIEWS}/${interviewId}/evaluation/decision`,
      payload
    ) as ApiResponse<IAIInterviewEvaluation>;
    return response.data;
  },

  regenerateEvaluation: async (
    interviewId: string,
    sessionId?: string
  ): Promise<IAIInterviewEvaluation | null> => {
    const response = await apiClient.post(
      `${API_ROUTES.HR.INTERVIEWS}/${interviewId}/evaluation/regenerate`,
      { sessionId }
    ) as ApiResponse<IAIInterviewEvaluation | null>;
    return response.data ?? null;
  },
};
