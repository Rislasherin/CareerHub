import { Notification } from "@domain/entities/Notification";
import { INotificationDocument } from "@infrastructure/database/models/common/notification.model";

export class NotificationMapper {
    static toDomain(doc: INotificationDocument): Notification {
        return new Notification(
            doc._id.toString(),
            doc.recipientId.toString(),
            doc.role,
            doc.title,
            doc.message,
            doc.type,
            doc.isRead,
            doc.link ?? null,
            doc.createdAt,
            doc.updatedAt
        );
    }
}
