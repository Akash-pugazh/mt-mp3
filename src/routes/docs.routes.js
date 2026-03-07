const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');
const { openApiSpec } = require('../docs/openapi');

const router = Router();

router.get('/swagger.json', (_req, res) => {
  res.json(openApiSpec);
});

router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    swaggerOptions: { persistAuthorization: false },
    customSiteTitle: 'MassTamilan API Docs',
  }),
);

module.exports = router;
