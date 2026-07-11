import { IGetMyNotificationsUseCase } from "../interfaces/IGetMyNotifications.usecase";
import { INotificationRepository } from "@domain/repositories/INotificationRepository";
import { Notification } from "@domain/entities/Notification";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";

export class GetMyNotificationsUseCase implements IGetMyNotificationsUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) { }

    async execute(userId: string, role: NotificationRole): Promise<{ notifications: Notification[], unreadCount: number }> {
        const notifications = await this.notificationRepository.findByRecipient(userId, role);
        const unreadCount = await this.notificationRepository.countUnread(userId, role);

        return { notifications, unreadCount };
    }
}
