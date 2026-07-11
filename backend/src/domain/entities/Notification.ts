import { NotificationRole } from "../enums/NotificationRole.enum";
import { NotificationType } from "../enums/NotificationType.enum";

export class Notification {
    constructor(
        public readonly id: string,
        public readonly recipientId: string,
        public readonly role: NotificationRole,
        public readonly title: string,
        public readonly message: string,
        public readonly type: NotificationType,
        public readonly isRead: boolean,
        public readonly link: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) {}
}
