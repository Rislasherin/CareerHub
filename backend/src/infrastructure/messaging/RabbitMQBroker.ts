import * as amqp from 'amqplib';
import { IMessageBroker } from '@application/interfaces/messaging/IMessageBroker';
import { env } from '../config/env.validator';
import { TraceContext } from '../observability/TraceContext';
import { Logger, LogCategory } from '../logger/logger';

export class RabbitMQBroker implements IMessageBroker {
  private _connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
  private _channel: Awaited<ReturnType<Awaited<ReturnType<typeof amqp.connect>>['createChannel']>> | null = null;

  async connect(retries = 5, delayMs = 3000): Promise<void> {
    if (this._connection) return;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = env.RABBITMQ_URL || 'amqp://localhost';
        this._connection = await amqp.connect(url);
        this._channel = await this._connection.createChannel(); // Keep the default channel for publishing
        Logger.info(LogCategory.SYSTEM_INFO, '[RabbitMQBroker] Connected to RabbitMQ');
        return;
      } catch (error) {
        Logger.error(LogCategory.SYSTEM_ERROR, `[RabbitMQBroker] Connection attempt ${attempt}/${retries} failed:`, error);
        if (attempt === retries) {
          throw error;
        }
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }

  async publish(queue: string, message: unknown): Promise<void> {
    if (!this._channel) await this.connect();

    const traceContext = TraceContext.get();

    await this._channel!.assertQueue(queue, { durable: true });
    this._channel!.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      headers: traceContext ? { traceContext } : {}
    });
    Logger.info(LogCategory.SYSTEM_INFO, `[RabbitMQBroker] Published message to queue ${queue}`);
  }

  async subscribe(queue: string, handler: (message: unknown, ack: () => void, nack: (requeue?: boolean) => void) => Promise<void>, prefetchCount = 1): Promise<void> {
    if (!this._connection) await this.connect();

    // Create a dedicated channel for this subscription so prefetch limits are isolated
    const subChannel = await this._connection!.createChannel();

    await subChannel.assertQueue(queue, { durable: true });
    
    // Ensure worker only processes `prefetchCount` jobs at a time from this queue
    await subChannel.prefetch(prefetchCount);

    Logger.info(LogCategory.SYSTEM_INFO, `[RabbitMQBroker] Subscribed to queue ${queue} with prefetch ${prefetchCount}`);
    
    subChannel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
      if (msg !== null) {
        let content;
        try {
          content = JSON.parse(msg.content.toString());
        } catch (e) {
          Logger.error(LogCategory.SYSTEM_ERROR, '[RabbitMQBroker] Failed to parse message', e);
          subChannel.nack(msg, false, false); // discard invalid message
          return;
        }

        let isHandled = false;

        const ack = () => {
          if (!isHandled) {
             subChannel.ack(msg);
             isHandled = true;
          }
        };
        const nack = (requeue: boolean = true) => {
          if (!isHandled) {
             subChannel.nack(msg, false, requeue);
             isHandled = true;
          }
        };

        try {
          const context = msg.properties?.headers?.traceContext;
          if (context) {
            await TraceContext.run(context, () => handler(content, ack, nack));
          } else {
            await handler(content, ack, nack);
          }
        } catch (error) {
          Logger.error(LogCategory.SYSTEM_ERROR, '[RabbitMQBroker] Handler failed:', error);
          nack(); // Defaults to requeue=true
        }
      }
    });
  }

  async close(): Promise<void> {
    try {
      if (this._channel) {
        await this._channel.close();
      }
      if (this._connection) {
        await this._connection.close();
      }
      Logger.info(LogCategory.SYSTEM_INFO, '[RabbitMQBroker] Connection closed');
    } catch (error) {
      Logger.error(LogCategory.SYSTEM_ERROR, '[RabbitMQBroker] Error closing connection:', error);
    }
  }
}
