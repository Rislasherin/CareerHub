import { apiClient } from '../api/api.client';
import { API_ROUTES } from '@/constants/api.routes';

export const getCollegeInterviews = async (): Promise<any> => {
    return await apiClient.get(API_ROUTES.COLLEGE.INTERVIEWS);
};

export const getCollegeOffers = async (): Promise<any> => {
    return await apiClient.get(API_ROUTES.COLLEGE.OFFERS);
};

export const getCollegeAnalytics = async (params?: { startDate?: string, endDate?: string }): Promise<any> => {
    return await apiClient.get(API_ROUTES.COLLEGE.REPORTS_ANALYTICS, { params });
};

export const exportCollegeAnalytics = async (format: string, params?: { startDate?: string, endDate?: string }): Promise<any> => {
    return await apiClient.get(API_ROUTES.COLLEGE.REPORTS_ANALYTICS + '/export', {
        params: { ...params, format },
        responseType: 'blob'
    });
};
