const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  baseUrl: process.env.BASE_URL || 'https://www.masstamilan.dev',
  requestTimeoutMs: toInt(process.env.REQUEST_TIMEOUT_MS, 15000),
  rateLimitWindowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  rateLimitMax: toInt(process.env.RATE_LIMIT_MAX, 60),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = { env };
