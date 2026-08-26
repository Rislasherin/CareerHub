export interface IMessageBroker {
  connect(): Promise<void>;
  publish(queue: string, message: any): Promise<void>;
  subscribe(queue: string, handler: (message: any, ack: () => void, nack: () => void) => Promise<void>): Promise<void>;
  close(): Promise<void>;
}
