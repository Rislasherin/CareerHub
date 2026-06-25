import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '../api/api.client';

import { PaginatedAdminResult } from '@/types/super-admin';

export const superAdminService = {
  getStats: async () => {
    const response = await apiClient.get(API_ROUTES.SUPER_ADMIN.DASHBOARD_STATS);
    return response.data;
  },

  getOrganizations: async (query = '', page = 1, limit = 10, status = '') => {
    const statusParam = status ? `&status=${status}` : '';
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.ORGANIZATIONS}?query=${query}&page=${page}&limit=${limit}${statusParam}`);
    return response.data;
  },

  updateOrganizationPlan: async (id: string, plan: string) => {
    const response = await apiClient.patch(`${API_ROUTES.SUPER_ADMIN.ORGANIZATIONS}/${id}/plan`, { plan });
    return response.data;
  },

  getStudents: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.STUDENTS}?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getCompanies: async (query = '', page = 1, limit = 10, status = '') => {
    const statusParam = status ? `&status=${status}` : '';
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.COMPANIES}?query=${query}&page=${page}&limit=${limit}${statusParam}`);
    return response.data;
  },

  getInterviewers: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.INTERVIEWERS}?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  updateStatus: async (role: string, id: string, status: string) => {
    const response = await apiClient.patch(`${API_ROUTES.SUPER_ADMIN.MANAGEMENT}/${role}/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (role: string, id: string) => {
    const response = await apiClient.delete(`${API_ROUTES.SUPER_ADMIN.MANAGEMENT}/${role}/${id}`);
    return response.data;
  }
};


