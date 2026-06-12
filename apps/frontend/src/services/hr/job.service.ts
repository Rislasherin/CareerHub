import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';

import { Job, GetHRJobsResponse } from '@/types/job';
import { ApiResponse } from '@/types/api';

export const postJob = async (payload: Omit<Job, 'id' | 'companyId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  const response = (await apiClient.post(API_ROUTES.HR.JOBS, payload)) as ApiResponse<Job>;
  return response.data;
};

export const updateJob = async (jobId: string, payload: Omit<Job, 'id' | 'companyId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  const response = (await apiClient.put(`${API_ROUTES.HR.JOBS}/${jobId}`, payload)) as ApiResponse<Job>;
  return response.data;
};

export const getHRJobs = async (
  page: number,
  limit: number,
  status?: string,
  query: string = ''
): Promise<GetHRJobsResponse> => {
  let url = `${API_ROUTES.HR.JOBS}?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = (await apiClient.get(url)) as ApiResponse<GetHRJobsResponse>;
  return response.data;
};

export const closeJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.patch(`${API_ROUTES.HR.JOBS}/${jobId}/close`, {})) as ApiResponse<Job>;
  return response.data;
};

export const deleteJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.delete(`${API_ROUTES.HR.JOBS}/${jobId}`)) as ApiResponse<Job>;
  return response.data;
};


