export enum LogCategory {
    SYSTEM_INFO = "SYSTEM_INFO",
    SYSTEM_ERROR = "SYSTEM_ERROR",
    AI_INTERVIEW_DB_FAILURE = "AI_INTERVIEW_DB_FAILURE",
    AI_INTERVIEW_RABBIT_FAILURE = "AI_INTERVIEW_RABBIT_FAILURE",
    AI_INTERVIEW_STT_FAILURE = "AI_INTERVIEW_STT_FAILURE",
    AI_INTERVIEW_TTS_FAILURE = "AI_INTERVIEW_TTS_FAILURE",
    AI_INTERVIEW_LIVEKIT_FAILURE = "AI_INTERVIEW_LIVEKIT_FAILURE"
}

export interface ILogger {
  info(arg1: string, arg2?: unknown, ...meta: unknown[]): void;
  warn(arg1: string, arg2?: unknown, ...meta: unknown[]): void;
  error(arg1: string | Error | unknown, arg2?: unknown, ...meta: unknown[]): void;
  debug(arg1: string, arg2?: unknown, ...meta: unknown[]): void;
}
