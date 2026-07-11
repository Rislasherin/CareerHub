import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { NotificationType } from "@domain/enums/NotificationType.enum";

export interface CreateSystemNotificationDto {
    recipientId: string;
    role: NotificationRole;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

export interface ICreateSystemNotificationUseCase {
    execute(data: CreateSystemNotificationDto): Promise<void>;
}
