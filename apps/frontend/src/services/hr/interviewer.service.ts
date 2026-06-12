import { apiClient } from '@/services/api/api.client';

export interface Interviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  isDeleted?: boolean;
}

export interface GetInterviewersResponse {
  interviewers: Interviewer[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const getInterviewers = async (page: number, limit: number, query: string = '', includeDeleted: boolean = false): Promise<GetInterviewersResponse> => {
  const response = await apiClient.get<unknown, ApiResponse<GetInterviewersResponse>>(`/hr/interviewers?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}&includeDeleted=${includeDeleted}`);
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

export const updateInterviewer = async (
  interviewerId: string,
  payload: { firstName?: string; lastName?: string; designation?: string; specialization?: string }
): Promise<void> => {
  await apiClient.put(`/hr/interviewers/${interviewerId}`, payload);
};

export const deleteInterviewer = async (interviewerId: string): Promise<void> => {
  await apiClient.delete(`/hr/interviewers/${interviewerId}`);
};

export const restoreInterviewer = async (interviewerId: string): Promise<void> => {
  await apiClient.post(`/hr/interviewers/${interviewerId}/restore`, {});
};

