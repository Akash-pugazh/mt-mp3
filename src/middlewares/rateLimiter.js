const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { globalRateLimiter };
