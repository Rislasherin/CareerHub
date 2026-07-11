import { Notification } from "@domain/entities/Notification";
import { IBaseRepository } from "./IBaseRepository";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";

export interface INotificationRepository extends IBaseRepository<Notification> {
    findByRecipient(recipientId: string, role: NotificationRole): Promise<Notification[]>;
    markAsRead(notificationId: string): Promise<Notification | null>;
    markAllAsRead(recipientId: string, role: NotificationRole): Promise<void>;
    countUnread(recipientId: string, role: NotificationRole): Promise<number>;
}
