const axios = require('axios');
const { env } = require('../config/env');

const httpClient = axios.create({
  baseURL: env.baseUrl,
  timeout: env.requestTimeoutMs,
  headers: {
    'User-Agent': [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'AppleWebKit/537.36 (KHTML, like Gecko)',
      'Chrome/122.0.0.0 Safari/537.36',
    ].join(' '),
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Referer: `${env.baseUrl}/`,
    'Upgrade-Insecure-Requests': '1',
  },
});

module.exports = { httpClient };
