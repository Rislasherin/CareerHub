import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';
import { StudentDashboardStats } from '@/types/student-dashboard';
import { ApiResponse } from '@/types/api';

export const getStudentDashboardStats = async (): Promise<StudentDashboardStats> => {
  const response = (await apiClient.get('/student/dashboard')) as ApiResponse<StudentDashboardStats>;
  return response.data;
};
