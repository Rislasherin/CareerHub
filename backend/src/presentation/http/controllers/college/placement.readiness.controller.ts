import { Request, Response } from 'express';
import { IGetPlacementReadinessUseCase } from '@application/usecases/college/interfaces/IGetPlacementReadiness.usecase';
import { sendSuccess } from '@shared/utils/response.util';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { Logger, LogCategory } from '../../../../infrastructure/logger/logger';

export class PlacementReadinessController {
  constructor(private readonly getPlacementReadinessUseCase: IGetPlacementReadinessUseCase) {}

  public getPlacementReadiness = async (req: Request, res: Response): Promise<void> => {
    try {
      const collegeId = (req as any).user?.orgId;
      if (!collegeId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const data = await this.getPlacementReadinessUseCase.execute(collegeId);
      sendSuccess(res, data, 'Placement readiness intelligence fetched successfully');
    } catch (error: any) {
      Logger.error(LogCategory.SYSTEM_ERROR, 'GetPlacementReadiness Error:', error.message);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };

  public sendReminder = async (req: Request, res: Response): Promise<void> => {
    try {
      const collegeId = (req as any).user?.orgId;
      const { studentId } = req.params;
      const { action } = req.body;
      if (!collegeId) {
        res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }
      
      const { makeSendPlacementReadinessReminderUseCase } = require('@infrastructure/di/college.factory');
      const useCase = makeSendPlacementReadinessReminderUseCase();
      await useCase.execute(collegeId, studentId, action);
      
      sendSuccess(res, null, 'Reminder sent successfully to the student via email and in-app notification');
    } catch (error: any) {
      Logger.error(LogCategory.SYSTEM_ERROR, 'SendReminder Error:', error.message);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
    }
  };
}
