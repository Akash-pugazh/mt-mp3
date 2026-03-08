import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi.js';

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

export default router;
