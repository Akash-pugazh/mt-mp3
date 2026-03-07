import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info({ port: env.port, env: env.nodeEnv }, 'Server started');
});

function shutdown(signal: string): void {
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
