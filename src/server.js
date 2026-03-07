const http = require('http');
const { app } = require('./app');
const { env } = require('./config/env');
const { logger } = require('./config/logger');

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, 'Server started');
});

function shutdown(signal) {
  logger.info({ signal }, 'Graceful shutdown started');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Shutdown failed');
      process.exit(1);
    }

    logger.info('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
