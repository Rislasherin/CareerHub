import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';
import { Job } from '@/types/job';
import { ApiResponse } from '@/types/api';

export const getPendingJobs = async (status?: string): Promise<Job[]> => {
  const url = status ? `${API_ROUTES.COLLEGE.JOBS}/pending?status=${status}` : `${API_ROUTES.COLLEGE.JOBS}/pending`;
  const response = (await apiClient.get(url)) as ApiResponse<Job[]>;
  return response.data;
};

export const approveJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.patch(`${API_ROUTES.COLLEGE.JOBS}/${jobId}/approve`, {})) as ApiResponse<Job>;
  return response.data;
};

export const rejectJob = async (jobId: string, reason: string): Promise<Job> => {
  const response = (await apiClient.patch(`${API_ROUTES.COLLEGE.JOBS}/${jobId}/reject`, { reason })) as ApiResponse<Job>;
  return response.data;
};


