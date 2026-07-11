import { IMarkNotificationReadUseCase } from "../interfaces/IMarkNotificationRead.usecase";
import { INotificationRepository } from "@domain/repositories/INotificationRepository";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
    constructor(private readonly notificationRepository: INotificationRepository) {}

    async execute(notificationId: string): Promise<void> {
        const notification = await this.notificationRepository.markAsRead(notificationId);
        if (!notification) {
            throw new AppError("Notification not found", HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND);
        }
    }

    async executeAll(userId: string, role: NotificationRole): Promise<void> {
        await this.notificationRepository.markAllAsRead(userId, role);
    }
}
