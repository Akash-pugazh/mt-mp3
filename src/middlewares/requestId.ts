import type { Request, Response, NextFunction } from 'express';
import { makeRequestId } from '../utils/requestId.js';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers['x-request-id'];
  const requestId = typeof incoming === 'string' && incoming.trim() ? incoming : makeRequestId();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
