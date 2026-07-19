export interface IHandlePaymentWebhookUseCase {
    execute(rawBody:string,signature:string,eventType:string,gatewaySubId:string): Promise<void>
}
