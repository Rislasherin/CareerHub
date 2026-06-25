import { NoticeRequest, NoticeResponse } from "@/types/notice"
import { apiClient } from "../api/api.client"

export const NoticeService = {
    getNotices:async(): Promise<NoticeResponse[]> =>{
        const response = await apiClient.get('/college/notices');
        return response.data?.data || response.data
    },

    createNotice: async(data:NoticeRequest): Promise<NoticeResponse> => {
        const response = await apiClient.post('/college/notices',data);
        return response.data?.data || response.data;
    },

    updateNotice: async(id:string,data:NoticeRequest):Promise<NoticeResponse> => {
        const response = await apiClient.patch(`/college/notices/${id}`, data)
        return response.data?.data || response.data;
    },
    deleteNotice: async(id:string):Promise<void> => {
        await apiClient.delete(`/college/notices/${id}`)
    }
}