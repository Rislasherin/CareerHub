import { Notice } from "@domain/entities/Notice";
import { NoticePriority } from "@domain/enums/NoticePriority";
import { NoticeDocument } from "@infrastructure/database/models/organizer/notice.model";

export const toNoticeEntity = (doc: NoticeDocument): Notice => {
    return {
        id: doc._id.toString(),
        title: doc.title || "",
        content: doc.content || "",
        priority: doc.priority as NoticePriority,
        collegeId: doc.collegeId?.toString() || "",
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    };
};

export const toNoticePersistence = (entity: Notice): Record<string, unknown> => {
    return {
        title: entity.title,
        content: entity.content,
        priority: entity.priority,
        collegeId: entity.collegeId,
        isActive: entity.isActive !== undefined ? entity.isActive : true,
    };
};