const { Router } = require('express');

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'masstamilan-express-api',
      version: '1.0.0',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
