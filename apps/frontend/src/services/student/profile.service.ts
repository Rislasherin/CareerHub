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

