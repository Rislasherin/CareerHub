export interface IHandlePaymentWebhookUseCase {
    execute(rawBody: string, signature: string, eventType: string, gatewaySubId: string, paymentId?: string, paymentAmount?: number, currency?: string): Promise<void>;
}
