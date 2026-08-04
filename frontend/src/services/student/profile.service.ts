import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';
import { ApiResponse } from '@/types/api';

import { StudentProfile, StudentExperience, StudentProject, StudentSkills } from '@/types/student';

export const getStudentProfile = async (): Promise<StudentProfile> => {
  const response = (await apiClient.get(API_ROUTES.STUDENT.PROFILE)) as ApiResponse<StudentProfile>;
  return response.data;
};

export const updateStudentProfile = async (payload: Partial<StudentProfile>): Promise<StudentProfile> => {
  const response = (await apiClient.put(API_ROUTES.STUDENT.PROFILE, payload)) as ApiResponse<StudentProfile>;
  return response.data;
};

export const uploadStudentResume = async (file: File): Promise<{ resume: import('@/types/student').ResumeMetadata, parsedData?: any }> => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = (await apiClient.post(`${API_ROUTES.STUDENT.PROFILE}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })) as ApiResponse<{ resume: import('@/types/student').ResumeMetadata, parsedData?: any }>;
  
  return response.data;
};

export const deleteStudentResume = async (): Promise<void> => {
  await apiClient.delete(`${API_ROUTES.STUDENT.PROFILE}/resume`);
};
