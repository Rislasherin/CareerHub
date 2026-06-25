import { NoticePriority } from "@domain/enums/NoticePriority";

export interface Notice {
    id?: string;
    title: string;
    content: string;
    priority: NoticePriority;
    collegeId: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date
}