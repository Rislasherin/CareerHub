export type NoticePriority =  'Urgent' | 'Important' | 'Normal';

export interface NoticeRequest {
    title: string;
    content: string;
    priority: NoticePriority;
}

export interface NoticeResponse {
    id: string;
    title: string;
    content: string;
    priority: NoticePriority;
    isActive: boolean;
    createdAt: string;
}