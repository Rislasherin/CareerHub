import { apiClient } from '@/services/api/api.client';
import { Job } from '@/services/hr/job.service';

export const getPendingJobs = async (status?: string): Promise<Job[]> => {
  const url = status ? `/college/jobs/pending?status=${status}` : '/college/jobs/pending';
  const response = (await apiClient.get(url)) as type;
  return response.data;
};

export const approveJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.patch(`/college/jobs/${jobId}/approve`, {})) as type;
  return response.data;
};

export const rejectJob = async (jobId: string, reason: string): Promise<Job> => {
  const response = (await apiClient.patch(`/college/jobs/${jobId}/reject`, { reason })) as type;
  return response.data;
};
