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
  },

  getPlatformSettings: async () => {
    const response = await apiClient.get('/super-admin/platform-settings');
    return response.data;
  },

  updatePlatformSettings: async (settingsData: any) => {
    const response = await apiClient.patch('/super-admin/platform-settings', settingsData);
    return response.data;
  },

  extendTrial: async (orgId: string, days: number) => {
    const response = await apiClient.patch(`${API_ROUTES.SUPER_ADMIN.ORGANIZATIONS}/${orgId}/extend-trial`, { days });
    return response.data;
  },

  getBillingInvoices: async (page = 1, limit = 10, search = '', status = '', planType = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (planType) params.append('planType', planType);
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.BILLING}?${params.toString()}`);
    return response.data;
  },

  sendRenewalReminder: async (subscriptionId: string) => {
    const response = await apiClient.post(`${API_ROUTES.SUPER_ADMIN.BILLING}/subscriptions/${subscriptionId}/remind`);
    return response.data;
  },

  getRevenueAnalytics: async (page = 1, limit = 10, search = '', status = '', planType = '') => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (planType) params.append('planType', planType);
    const response = await apiClient.get(`${API_ROUTES.SUPER_ADMIN.REVENUE_ANALYTICS}?${params.toString()}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/super-admin/profile');
    return response;
  },

  updateProfile: async (data: { firstName: string; lastName: string }) => {
    const response = await apiClient.patch('/super-admin/profile', data);
    return response;
  },

  changePassword: async (data: any) => {
    const response = await apiClient.post('/super-admin/change-password', data);
    return response.data;
  },

  requestEmailChange: async (data: { newEmail: string }) => {
    const response = await apiClient.post('/super-admin/request-email-change', data);
    return response.data;
  },

  verifyEmailChange: async (data: { email: string; otp: string }) => {
    const response = await apiClient.post('/super-admin/verify-email-change', data);
    return response.data;
  }
};


