import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';
import { ApiResponse } from '@/types/api';

import { HRDashboardStats } from '@/types/dashboard';

export const getHRDashboardStats = async (): Promise<HRDashboardStats> => {
  const response = await apiClient.get(API_ROUTES.HR.DASHBOARD_STATS) as ApiResponse<HRDashboardStats>;
  return response.data;
};

