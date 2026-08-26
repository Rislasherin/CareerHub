import { Logger, LogCategory } from '../logger/logger';
import { TraceContext } from './TraceContext';

export class Metrics {
  static recordLatency(operation: string, durationMs: number, provider?: string, additionalData?: any) {
    const context = TraceContext.get();
    Logger.info(LogCategory.SYSTEM_INFO, `[METRIC] ${operation} completed`, {
      type: 'METRIC',
      metricName: operation,
      durationMs,
      provider,
      ...context,
      ...additionalData
    });
  }

  static recordEvent(eventName: string, status: 'SUCCESS' | 'FAILURE' = 'SUCCESS', additionalData?: any) {
    const context = TraceContext.get();
    const payload = {
      type: 'METRIC',
      metricName: eventName,
      status,
      ...context,
      ...additionalData
    };

    if (status === 'FAILURE') {
      Logger.error(LogCategory.SYSTEM_INFO, `[METRIC] ${eventName} failed`, payload);
    } else {
      Logger.info(LogCategory.SYSTEM_INFO, `[METRIC] ${eventName} succeeded`, payload);
    }
  }

  static recordCount(counterName: string, value: number = 1, additionalData?: any) {
    const context = TraceContext.get();
    Logger.info(LogCategory.SYSTEM_INFO, `[METRIC] ${counterName}`, {
      type: 'METRIC',
      metricName: counterName,
      count: value,
      ...context,
      ...additionalData
    });
  }
}
