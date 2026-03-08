/// <reference path="./types/express.d.ts" />
import express from 'express';
import type { Request, Response, RequestHandler, ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import type { IncomingMessage } from 'node:http';
import routes from './routes/index.js';
import docsRoutes from './routes/docs.routes.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { requestIdMiddleware } from './middlewares/requestId.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.disable('x-powered-by');
app.use(requestIdMiddleware as RequestHandler);
app.use(
  (pinoHttp as unknown as typeof pinoHttp.default)({
    logger,
    genReqId: ((req: IncomingMessage) =>
      (req as unknown as Request).requestId) as pinoHttp.GenReqId,
  }) as unknown as RequestHandler,
);
app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(globalRateLimiter);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'MassTamilan Unofficial API',
      docs: '/docs',
      openapi: '/swagger.json',
      version: 'v1',
    },
  });
});

app.use(docsRoutes);
app.use('/api', routes);
app.use(notFoundHandler as unknown as RequestHandler);
app.use(errorHandler as unknown as ErrorRequestHandler);

export { app };
