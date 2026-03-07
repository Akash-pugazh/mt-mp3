const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const pinoHttp = require('pino-http');
const routes = require('./routes');
const docsRoutes = require('./routes/docs.routes');
const { env } = require('./config/env');
const { logger } = require('./config/logger');
const { requestIdMiddleware } = require('./middlewares/requestId');
const { globalRateLimiter } = require('./middlewares/rateLimiter');
const { notFoundHandler } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
app.use(requestIdMiddleware);
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.requestId,
  }),
);
app.use(helmet());
app.use(cors({ origin: env.corsOrigin === '*' ? true : env.corsOrigin }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(globalRateLimiter);

app.get('/', (_req, res) => {
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
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };
