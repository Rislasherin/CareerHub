import { IGetMyNotificationsUseCase } from "../interfaces/IGetMyNotifications.usecase";
import { INotificationRepository } from "@domain/repositories/INotificationRepository";
import { Notification } from "@domain/entities/Notification";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";

export class GetMyNotificationsUseCase implements IGetMyNotificationsUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(userId: string, role: NotificationRole, page: number = 1, limit: number = 10): Promise<{ notifications: Notification[], unreadCount: number, total: number }> {
        const notifications = await this.notificationRepository.findByRecipient(userId, role);
        const unreadCount = await this.notificationRepository.countUnread(userId, role);
        const total = notifications.length;
        const startIndex = (page - 1) * limit;
        const paginatedNotifications = notifications.slice(startIndex, startIndex + limit);
        
        return { notifications: paginatedNotifications, unreadCount, total };
    }
}
