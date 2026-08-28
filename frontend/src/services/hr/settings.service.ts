import { apiClient } from '@/services/api/api.client';

export const getHRProfile = async () => {
  const { data } = await apiClient.get('/hr/settings/account');
  return data;
};

export const updateHRProfile = async (payload: { firstName?: string; lastName?: string; designation?: string }) => {
  const { data } = await apiClient.patch('/hr/settings/account', payload);
  return data;
};

export const changeHRPassword = async (payload: any) => {
  const { data } = await apiClient.patch('/hr/settings/account/password', payload);
  return data;
};

export const requestHREmailChange = async (payload: { newEmail: string }) => {
  const { data } = await apiClient.post('/hr/settings/account/email/request', payload);
  return data;
};

export const verifyHREmailChange = async (payload: { email: string; otp: string }) => {
  const { data } = await apiClient.post('/hr/settings/account/email/verify', payload);
  return data;
};

export const getCompanyProfile = async () => {
  const { data } = await apiClient.get('/hr/settings/company');
  return data;
};

export const updateCompanyProfile = async (payload: any) => {
  const { data } = await apiClient.patch('/hr/settings/company', payload);
  return data;
};
