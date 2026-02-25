const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { getReports, downloadMonthlyReport, downloadOptimizationReport } = require('../controllers/reportController');

const router = Router();

router.use(authenticate);
router.get('/', getReports);
router.get('/monthly/:year/:month', downloadMonthlyReport);
router.get('/optimization', downloadOptimizationReport);

module.exports = router;
