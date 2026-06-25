import { apiClient } from '../api/api.client';
import { NoticeResponse } from '@/types/notice';

export const StudentNoticeService = {
    getNotices: async (): Promise<NoticeResponse[]> => {
        const response = await apiClient.get('/student/notices');
        return response.data?.data || response.data;
    }
};
