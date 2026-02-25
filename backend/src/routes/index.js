const { Router } = require('express');
const authRoutes = require('./auth');
const costRoutes = require('./costs');
const resourceRoutes = require('./resources');
const alertRoutes = require('./alerts');
const recommendationRoutes = require('./recommendations');
const budgetRoutes = require('./budgets');
const reportRoutes = require('./reports');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' } });
});

router.use('/auth', authRoutes);
router.use('/costs', costRoutes);
router.use('/resources', resourceRoutes);
router.use('/alerts', alertRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/budgets', budgetRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
