const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getDashboard, getCostTrend, getCostByService, getCostByRegion,
  getCostByResourceGroup, getForecast, getTagAnalysis,
} = require('../controllers/costController');

const router = Router();

router.use(authenticate);
router.get('/dashboard', getDashboard);
router.get('/trend', getCostTrend);
router.get('/by-service', getCostByService);
router.get('/by-region', getCostByRegion);
router.get('/by-resource-group', getCostByResourceGroup);
router.get('/forecast', getForecast);
router.get('/tags', getTagAnalysis);

module.exports = router;
