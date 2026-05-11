import { apiClient } from '../api/api.client';

export const OrganizationService = {
  getOrganizations: async () => {
    // In a real scenario, this would call the backend
    // return apiClient('/organizations');
    
    // Mock for development
    return [
      { id: '1', name: 'Indian Institute of Technology (IIT)' },
      { id: '2', name: 'National Institute of Technology (NIT)' },
      { id: '3', name: 'Birla Institute of Technology (BITS)' },
    ];
  }
};
