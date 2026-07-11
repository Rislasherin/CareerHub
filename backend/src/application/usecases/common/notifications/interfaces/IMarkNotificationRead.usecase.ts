import { NotificationRole } from "@domain/enums/NotificationRole.enum";

export interface IMarkNotificationReadUseCase {
    execute(notificationId: string): Promise<void>;
    executeAll(userId: string, role: NotificationRole): Promise<void>;
}
