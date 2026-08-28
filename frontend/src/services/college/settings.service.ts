import { apiClient } from '@/services/api/api.client';

export interface UpdateCollegeProfilePayload {
  name: string;
  organizerName: string;
  phone?: string;
  website?: string;
  instituteType?: string;
  address?: string;
}

export const getCollegeProfile = async (): Promise<any> => {
  return await apiClient.get('/college/settings/profile');
};

export const updateCollegeProfile = async (payload: UpdateCollegeProfilePayload): Promise<any> => {
  return await apiClient.patch('/college/settings/profile', payload);
};

export const changeCollegePassword = async (payload: any): Promise<any> => {
  return await apiClient.patch('/college/settings/password', payload);
};

export const requestCollegeEmailChange = async (payload: { newEmail: string }): Promise<any> => {
  return await apiClient.post('/college/settings/email/request', payload);
};

export const verifyCollegeEmailChange = async (payload: { email: string; otp: string }): Promise<any> => {
  return await apiClient.post('/college/settings/email/verify', payload);
};
