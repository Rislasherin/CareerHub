import { apiClient } from '../api/api.client';

export interface PaginatedResult<T> {
  organizations?: T[];
  students?: T[];
  companies?: T[];
  interviewers?: T[];
  total: number;
  page: number;
  limit: number;
}

export const superAdminService = {
  getStats: async () => {
    const response = await apiClient.get('/super-admin/dashboard/stats');
    return response.data;
  },

  getOrganizations: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`/super-admin/organizations?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  updateOrganizationPlan: async (id: string, plan: string) => {
    const response = await apiClient.patch(`/super-admin/organizations/${id}/plan`, { plan });
    return response.data;
  },

  getStudents: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`/super-admin/students?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getCompanies: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`/super-admin/companies?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getInterviewers: async (query = '', page = 1, limit = 10) => {
    const response = await apiClient.get(`/super-admin/interviewers?query=${query}&page=${page}&limit=${limit}`);
    return response.data;
  },

  updateStatus: async (role: string, id: string, status: string) => {
    const response = await apiClient.patch(`/super-admin/management/${role}/${id}/status`, { status });
    return response.data;
  },

  deleteUser: async (role: string, id: string) => {
    const response = await apiClient.delete(`/super-admin/management/${role}/${id}`);
    return response.data;
  }
};
