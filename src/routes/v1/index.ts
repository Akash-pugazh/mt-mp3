import { Router } from 'express';
import healthRoutes from './health.routes.js';
import masstamilanRoutes from './masstamilan.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/', masstamilanRoutes);

export default router;
