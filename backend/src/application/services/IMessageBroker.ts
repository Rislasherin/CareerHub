export interface IMessageBroker {
  publish(queue: string, payload: Record<string, unknown>): Promise<void>;
}
