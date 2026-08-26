import { AsyncLocalStorage } from 'node:async_hooks';

export interface ITraceContext {
  traceId: string;
  sessionId?: string;
  turnId?: string;
  questionId?: string;
  requestId?: string;
  jobId?: string;
}

export const traceLocalStorage = new AsyncLocalStorage<ITraceContext>();

export class TraceContext {
  static run<R>(context: ITraceContext, callback: () => R): R {
    return traceLocalStorage.run(context, callback);
  }

  static get(): ITraceContext | undefined {
    return traceLocalStorage.getStore();
  }

  static getTraceId(): string | undefined {
    return this.get()?.traceId;
  }
}
