import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { TraceContext } from '../../../infrastructure/observability/TraceContext';

export const tracingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  const sessionId = (req.headers['x-session-id'] as string) || (req.body?.sessionId as string) || (req.query?.sessionId as string);
  
  TraceContext.run({ traceId, requestId, sessionId }, () => {
    // Set headers on response so clients can track trace IDs
    res.setHeader('x-trace-id', traceId);
    next();
  });
};
