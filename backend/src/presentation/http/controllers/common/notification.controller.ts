import { Request, Response, NextFunction } from "express";
import { IGetMyNotificationsUseCase } from "@application/usecases/common/notifications/interfaces/IGetMyNotifications.usecase";
import { IMarkNotificationReadUseCase } from "@application/usecases/common/notifications/interfaces/IMarkNotificationRead.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { MESSAGES } from "@shared/constants/messages.constants";
import { sendSuccess } from "@shared/utils/response.util";

export class NotificationController {
    constructor(
        private readonly _getMyNotificationsUseCase: IGetMyNotificationsUseCase,
        private readonly _markNotificationReadUseCase: IMarkNotificationReadUseCase
    ) { }

    public getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            let userId = user.id;
            let role: NotificationRole;

            if (user.role === 'hr') {
                userId = user.companyId;
                role = NotificationRole.HR;
            } else if (user.role === 'college_admin') {
                userId = user.orgId;
                role = NotificationRole.ADMIN;
            } else if (user.role === 'student') {
                role = NotificationRole.STUDENT;
            } else if (user.role === 'interviewer') {
                role = NotificationRole.INTERVIEWER;
            } else {
                role = NotificationRole.SUPER_ADMIN;
            }

            const data = await this._getMyNotificationsUseCase.execute(userId, role);
            sendSuccess(res, data, MESSAGES.SUCCESS.FETCHED);
        } catch (error) {
            next(error);
        }
    };

    public markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this._markNotificationReadUseCase.execute(id);
            sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
        } catch (error) {
            next(error);
        }
    };

    public markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            let userId = user.id;
            let role: NotificationRole;

            if (user.role === 'hr') {
                userId = user.companyId;
                role = NotificationRole.HR;
            } else if (user.role === 'college_admin') {
                userId = user.orgId;
                role = NotificationRole.ADMIN;
            } else if (user.role === 'student') {
                role = NotificationRole.STUDENT;
            } else if (user.role === 'interviewer') {
                role = NotificationRole.INTERVIEWER;
            } else {
                role = NotificationRole.SUPER_ADMIN;
            }

            await this._markNotificationReadUseCase.executeAll(userId, role);
            sendSuccess(res, null, MESSAGES.SUCCESS.UPDATED);
        } catch (error) {
            next(error);
        }
    };
}
