const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getCosts, getCostById, getDailyTrend, getCostByService,
  getCostByRegion, getSummary, getAnomalies, getForecast, createCostRecord,
} = require('../controllers/costController');

router.use(auth);
router.get('/', getCosts);
router.get('/summary', getSummary);
router.get('/trend', getDailyTrend);
router.get('/by-service', getCostByService);
router.get('/by-region', getCostByRegion);
router.get('/anomalies', getAnomalies);
router.get('/forecast', getForecast);
router.get('/:id', getCostById);
router.post('/', createCostRecord);

module.exports = router;
