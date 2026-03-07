const { ZodError } = require('zod');
const { AppError } = require('../errors/AppError');
const { logger } = require('../config/logger');

function errorHandler(err, req, res, _next) {
  let statusCode = 500;
  let message = 'Internal server error';
  let details = null;

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

module.exports = { errorHandler };
