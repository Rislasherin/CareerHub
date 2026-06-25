import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';

import { Interviewer, GetInterviewersResponse } from '@/types/interviewer';
import { ApiResponse } from '@/types/api';

export const getInterviewers = async (page: number, limit: number, query: string = '', includeDeleted: boolean = false): Promise<GetInterviewersResponse> => {
  const response = await apiClient.get<unknown, ApiResponse<GetInterviewersResponse>>(`/hr/interviewers?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}&includeDeleted=${includeDeleted}`);
  return response.data;
};

export const addInterviewer = async (payload: { firstName: string; lastName: string; email: string }): Promise<void> => {
  await apiClient.post(API_ROUTES.HR.INTERVIEWERS, payload);
};

export const toggleInterviewerStatus = async (interviewerId: string): Promise<void> => {
  await apiClient.patch(`${API_ROUTES.HR.INTERVIEWERS}/${interviewerId}/toggle-status`, {});
};

export const resendInterviewerInvite = async (interviewerId: string): Promise<void> => {
  await apiClient.post(`${API_ROUTES.HR.INTERVIEWERS}/${interviewerId}/resend-invite`, {});
};

export const updateInterviewer = async (
  interviewerId: string,
  payload: { firstName?: string; lastName?: string; designation?: string; specialization?: string }
): Promise<void> => {
  await apiClient.put(`${API_ROUTES.HR.INTERVIEWERS}/${interviewerId}`, payload);
};

export const deleteInterviewer = async (interviewerId: string): Promise<void> => {
  await apiClient.delete(`${API_ROUTES.HR.INTERVIEWERS}/${interviewerId}`);
};

export const restoreInterviewer = async (interviewerId: string): Promise<void> => {
  await apiClient.post(`${API_ROUTES.HR.INTERVIEWERS}/${interviewerId}/restore`, {});
};



