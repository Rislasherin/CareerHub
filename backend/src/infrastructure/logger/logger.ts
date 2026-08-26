import * as winston from "winston";
import "winston-daily-rotate-file";
import { TraceContext } from "../observability/TraceContext";

const { combine, timestamp, errors, json } = winston.format;

const SENSITIVE_KEYS = ["authorization", "api_key", "token", "candidateAnswer", "jwt", "password", "livekitToken"];

const redactSensitiveData = winston.format((info) => {
  const sanitize = (obj: unknown): unknown => {
    if (!obj || typeof obj !== "object") return obj;

    // Fast check for Date, Array, etc.
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);

    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase()))) {
        sanitizedObj[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        sanitizedObj[key] = sanitize(value);
      } else {
        sanitizedObj[key] = value;
      }
    }
    return sanitizedObj;
  };

  const sanitized = sanitize(info) as winston.Logform.TransformableInfo;
  const symbols = Object.getOwnPropertySymbols(info);
  const infoWithSymbols = info as Record<symbol, unknown>;
  const sanitizedWithSymbols = sanitized as Record<symbol, unknown>;
  for (const sym of symbols) {
    sanitizedWithSymbols[sym] = infoWithSymbols[sym];
  }
  return sanitized;
});

const traceContextInjection = winston.format((info) => {
  const context = TraceContext.get();
  if (context) {
    Object.assign(info, context);
  }
  return info;
});

const devConsoleFormat = winston.format.printf((info) => {
  let timeStr = info.timestamp || '';
  if (typeof timeStr === 'string' && timeStr.includes(' ')) {
    timeStr = timeStr.split(' ')[1];
  }
  const lvl = info.level.toUpperCase().padEnd(5);
  
  let out = `${timeStr} ${lvl} ${info.message}`;
  
  if (info.sessionId) out += `\nSession: ${info.sessionId}`;
  if (info.traceId) out += `\nTrace: ${info.traceId}`;
  
  if (info.error) {
    const err = info.error as any;
    if (err.message) out += `\nError: ${err.message}`;
    if (err.stack) out += `\n${err.stack}`;
  } else if (info.stack) {
    out += `\n${info.stack}`;
  }
  
  return out;
});

const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    winston.format.splat(),
    traceContextInjection(),
    redactSensitiveData(),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? undefined : devConsoleFormat
    }),
    new winston.transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxFiles: "14d",
    }),
    new winston.transports.DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
});

import { LogCategory } from "../../application/interfaces/observability/ILogger";

const wrapMeta = (category: string | null, meta: unknown[]) => {
  let metaObj: Record<string, unknown> = category ? { category } : {};
  
  if (meta.length > 0) {
    const firstMeta = meta[0];
    if (firstMeta instanceof Error) {
      metaObj.error = {
        message: firstMeta.message,
        stack: firstMeta.stack,
        name: firstMeta.name
      };
    } else if (typeof firstMeta === "object" && firstMeta !== null && !Array.isArray(firstMeta)) {
      metaObj = { ...metaObj, ...firstMeta };
    } else {
      metaObj.data = meta.length === 1 ? firstMeta : meta;
    }
  }
  return metaObj;
};

const parseArgs = (arg1: unknown, arg2?: unknown, meta: unknown[] = []) => {
  if (typeof arg1 === "string" && Object.values(LogCategory).includes(arg1 as LogCategory)) {
    return {
      message: typeof arg2 === "string" ? arg2 : String(arg2),
      category: arg1 as LogCategory,
      metaArgs: meta
    };
  }
  
  let message = typeof arg1 === "string" ? arg1 : "";
  let metaArgs = [arg2, ...meta].filter(x => x !== undefined);
  
  if (arg1 instanceof Error) {
    message = arg1.message;
    metaArgs = [arg1, ...metaArgs];
  } else if (typeof arg1 !== "string") {
    message = String(arg1);
  }
  
  return { message, category: null, metaArgs };
};

export const Logger = {
  info: (arg1: string, arg2?: unknown, ...meta: unknown[]) => {
    const { message, category, metaArgs } = parseArgs(arg1, arg2, meta);
    winstonLogger.info(message, wrapMeta(category, metaArgs));
  },
  warn: (arg1: string, arg2?: unknown, ...meta: unknown[]) => {
    const { message, category, metaArgs } = parseArgs(arg1, arg2, meta);
    winstonLogger.warn(message, wrapMeta(category, metaArgs));
  },
  error: (arg1: string | Error | unknown, arg2?: unknown, ...meta: unknown[]) => {
    const { message, category, metaArgs } = parseArgs(arg1, arg2, meta);
    winstonLogger.error(message, wrapMeta(category, metaArgs));
  },
  debug: (arg1: string, arg2?: unknown, ...meta: unknown[]) => {
    const { message, category, metaArgs } = parseArgs(arg1, arg2, meta);
    winstonLogger.debug(message, wrapMeta(category, metaArgs));
  }
};

export { Logger as logger, LogCategory };
