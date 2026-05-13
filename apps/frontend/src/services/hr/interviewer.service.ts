import { apiClient } from '@/services/api/api.client';

export interface Interviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
}

export interface GetInterviewersResponse {
  interviewers: Interviewer[];
  total: number;
  page: number;
  limit: number;
}

export const getInterviewers = async (page: number, limit: number, query: string = ''): Promise<GetInterviewersResponse> => {
  const response = await apiClient.get(`/hr/interviewers?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`) as any;
  return response.data;
};

export const addInterviewer = async (payload: { firstName: string; lastName: string; email: string }): Promise<void> => {
  await apiClient.post('/hr/interviewers', payload);
};

export const toggleInterviewerStatus = async (interviewerId: string): Promise<void> => {
  await apiClient.patch(`/hr/interviewers/${interviewerId}/toggle-status`, {});
};

export const resendInterviewerInvite = async (interviewerId: string): Promise<void> => {
  await apiClient.post(`/hr/interviewers/${interviewerId}/resend-invite`, {});
};
