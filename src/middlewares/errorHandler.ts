import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    details = err.issues;
  }

  logger.error(
    {
      err,
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
    },
    'Request failed',
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details,
      requestId: req.requestId,
    },
  });
}
