import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '../api/api.client';

export const OrganizationService = {
  getOrganizations: async (): Promise<{ id: string; name: string; activeBranches?: string[] }[]> => {
    const response = (await apiClient.get(API_ROUTES.AUTH.ORGANIZATIONS_APPROVED)) as any;
    return response.data || [];
  }
};

