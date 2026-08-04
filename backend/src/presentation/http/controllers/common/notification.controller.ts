import { Request, Response, NextFunction } from "express";
import { IGetMyNotificationsUseCase } from "@application/usecases/common/notifications/interfaces/IGetMyNotifications.usecase";
import { IMarkNotificationReadUseCase } from "@application/usecases/common/notifications/interfaces/IMarkNotificationRead.usecase";
import { NotificationRole } from "@domain/enums/NotificationRole.enum";
import { MESSAGES } from "@shared/constants/messages.constants";
import { sendSuccess } from "@shared/utils/response.util";
import { AppError } from "@application/errors/AppError";
import { HttpStatus } from "@domain/enums/HttpStatus.enum";
import { ErrorCode } from "@domain/enums/ErrorCodes.enum";

export class NotificationController {
    constructor(
        private readonly _getMyNotificationsUseCase: IGetMyNotificationsUseCase,
        private readonly _markNotificationReadUseCase: IMarkNotificationReadUseCase
    ) { }

    public getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = req.user;
            if (!user) throw new AppError("Not authenticated", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);

            let userId: string = user.id;
            let role: NotificationRole;

            if (user.role === 'hr') {
                userId = user.companyId as string;
                role = NotificationRole.HR;
            } else if (user.role === 'college_admin') {
                userId = user.orgId as string;
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
            const user = req.user;
            if (!user) throw new AppError("Not authenticated", HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED);

            let userId: string = user.id;
            let role: NotificationRole;

            if (user.role === 'hr') {
                userId = user.companyId as string;
                role = NotificationRole.HR;
            } else if (user.role === 'college_admin') {
                userId = user.orgId as string;
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
