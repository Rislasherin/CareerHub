import { API_ROUTES } from '@/constants/api.routes';
import { apiClient } from '@/services/api/api.client';
import { ApiResponse } from '@/types/api';

export interface CreateSubscriptionResponse {
  gatewaySubscriptionId: string;
}

export const createSubscription = async (planType: 'BASIC' | 'PRO'): Promise<CreateSubscriptionResponse> => {
  const response = await apiClient.post(API_ROUTES.SUBSCRIPTION.CREATE, { planType }) as ApiResponse<CreateSubscriptionResponse>;
  return response.data;
};

export const getMyPlan = async (): Promise<any> => {
  const response = await apiClient.get(API_ROUTES.SUBSCRIPTION.GET_MY_PLAN) as ApiResponse<any>;
  return response.data;
};
