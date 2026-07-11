import { Notification } from "@domain/entities/Notification";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";

export interface IGetMyNotificationsUseCase {
    execute(userId: string, role: NotificationRole): Promise<{ notifications: Notification[], unreadCount: number }>;
}
