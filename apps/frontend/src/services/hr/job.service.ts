import { apiClient } from '@/services/api/api.client';

export interface InterviewRoundConfig {
  roundNumber: number;
  name: string;
  type: "aptitude" | "coding" | "technical" | "hr" | "group_discussion";
  description?: string;
}

export interface EligibilityCriteria {
  minCGPA: number;
  allowedBacklogs: number;
  eligibleBranches: string[];
  passingYear: number;
  degreeType: string;
}

export interface Job {
  id: string;
  companyId: string;
  collegeId: string;
  title: string;
  category: string;
  openings: number;
  deadline: string;
  type: string;
  eligibility: EligibilityCriteria;
  noticePeriod: string;
  experienceLevel: string;
  workMode: "on-site" | "remote" | "hybrid";
  location: string;
  salaryType: "per_month" | "per_year";
  minSalary: number;
  maxSalary: number;
  interviewMode: "online" | "offline" | "hybrid";
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  rounds: InterviewRoundConfig[];
  status: 'pending_review' | 'approved' | 'rejected' | 'active' | 'closed';
  rejectionNote?: string;
  approvedColleges?: string[];
  rejectedColleges?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetHRJobsResponse {
  jobs: Job[];
  total: number;
}

export const postJob = async (payload: Omit<Job, 'id' | 'companyId' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
  const response = (await apiClient.post('/hr/jobs', payload)) as type;
  return response.data;
};

export const getHRJobs = async (
  page: number,
  limit: number,
  status?: string,
  query: string = ''
): Promise<GetHRJobsResponse> => {
  let url = `/hr/jobs?page=${page}&limit=${limit}&query=${encodeURIComponent(query)}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = (await apiClient.get(url)) as type;
  return response.data;
};

export const closeJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.patch(`/hr/jobs/${jobId}/close`, {})) as type;
  return response.data;
};

export const deleteJob = async (jobId: string): Promise<Job> => {
  const response = (await apiClient.delete(`/hr/jobs/${jobId}`)) as type;
  return response.data;
};
