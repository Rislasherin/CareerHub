import { Request, Response } from 'express';
import { ICreateSubscriptionUseCase } from '@application/usecases/college/interfaces/ICreateSubscription.usecase';
import { IHandlePaymentWebhookUseCase } from '@application/usecases/college/interfaces/IHandlePaymentWebhook.usecase';
import { HttpStatus } from '@domain/enums/HttpStatus.enum';
import { sendSuccess } from '@shared/utils/response.util';
import { MESSAGES } from '@shared/constants/messages.constants';

export class SubscriptionController {
  constructor(
    private readonly createSubscriptionUseCase: ICreateSubscriptionUseCase,
    private readonly handleWebhookUseCase: IHandlePaymentWebhookUseCase
  ) {}

  public create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType } = req.body;
      const collegeId = (req as any).user?.id || req.body.collegeId; 

      const result = await this.createSubscriptionUseCase.execute(collegeId, planType);
      sendSuccess(res, result, MESSAGES.SUCCESS.CREATED, HttpStatus.CREATED);
    } catch (error: any) {
      const message = error?.error?.description || error.message || MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
      console.error("Subscription Error:", message);
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: message });
    }
  };

  public webhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = req.body; // Needs express.raw middleware
      
      const payload = JSON.parse(rawBody.toString());
      const eventType = payload.event;
      const gatewaySubId = payload.payload.subscription.entity.id;

      await this.handleWebhookUseCase.execute(rawBody.toString(), signature, eventType, gatewaySubId);
      
      res.status(HttpStatus.OK).send(MESSAGES.SUCCESS.UPDATED);
    } catch (error: any) {
      console.error("Webhook Error:", error.message);
      res.status(HttpStatus.BAD_REQUEST).send(MESSAGES.ERROR.VALIDATION_ERROR);
    }
  };
}
