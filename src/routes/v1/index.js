const { Router } = require('express');
const healthRoutes = require('./health.routes');
const masstamilanRoutes = require('./masstamilan.routes');

const router = Router();

router.use('/health', healthRoutes);
router.use('/', masstamilanRoutes);

module.exports = router;
