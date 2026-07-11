import { GetMyNotificationsUseCase } from "@application/usecases/common/notifications/implementations/GetMyNotifications.usecase";
import { MarkNotificationReadUseCase } from "@application/usecases/common/notifications/implementations/MarkNotificationRead.usecase";
import { NotificationController } from "@presentation/http/controllers/common/notification.controller";
import { notificationRepository } from "./infra.container";

const getMyNotificationsUseCase = new GetMyNotificationsUseCase(notificationRepository);
const markNotificationReadUseCase = new MarkNotificationReadUseCase(notificationRepository);

export const notificationController = new NotificationController(
    getMyNotificationsUseCase,
    markNotificationReadUseCase
);
