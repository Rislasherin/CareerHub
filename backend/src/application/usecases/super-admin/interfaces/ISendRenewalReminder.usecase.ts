export interface ISendRenewalReminderUseCase {
  execute(subscriptionId: string): Promise<void>;
}
