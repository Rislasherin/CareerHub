import { apiClient } from '../api/api.client';

export const OrganizationService = {
  getOrganizations: async (): Promise<{ id: string; name: string; activeBranches?: string[] }[]> => {
    const response = (await apiClient.get('/auth/organizations/approved')) as type;
    return response.data || [];
  }
};
