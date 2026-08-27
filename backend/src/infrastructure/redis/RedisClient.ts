import Redis from 'ioredis';
import { Logger, LogCategory } from '../logger/logger';

class RedisClientService {
  private client: Redis | null = null;
  private isConnecting: boolean = false;
  private connectPromise: Promise<void> | null = null;

  public getClient(): Redis {
    if (!this.client) {
      this.connect().catch(() => {});
    }
    return this.client!;
  }

  public isReady(): boolean {
    return this.client?.status === 'ready';
  }

  public connect(): Promise<void> {
    if (this.client) return Promise.resolve();
    if (this.connectPromise) return this.connectPromise;
    
    this.isConnecting = true;
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    Logger.info(LogCategory.SYSTEM_INFO, `[RedisClient] Connecting to Redis at ${redisUrl}`);
    
    this.connectPromise = new Promise((resolve) => {
      this.client = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      }
    });

    this.client.on('ready', () => {
      Logger.info(LogCategory.SYSTEM_INFO, `[RedisClient] Successfully connected and ready to accept commands.`);
      this.isConnecting = false;
      resolve();
    });

    this.client.on('error', (err) => {
      Logger.error(LogCategory.SYSTEM_ERROR, `[RedisClient] Redis Error: ${err.message}`, err);
    });

    this.client.on('close', () => {
      Logger.warn(LogCategory.SYSTEM_INFO, `[RedisClient] Connection closed.`);
    });
    });

    return this.connectPromise;
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      Logger.info(LogCategory.SYSTEM_INFO, `[RedisClient] Disconnected gracefully.`);
    }
  }
}

export const RedisClient = new RedisClientService();
