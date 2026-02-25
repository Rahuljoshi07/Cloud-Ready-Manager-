const express = require('express');
const router = express.Router();
const {
  getMonthlyCost, getDailyCosts, getCostByService,
  getCostByRegion, getCostByResourceGroup, getTopResources,
  getForecast, getSummary
} = require('../controllers/costController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', getSummary);
router.get('/monthly', getMonthlyCost);
router.get('/daily', getDailyCosts);
router.get('/by-service', getCostByService);
router.get('/by-region', getCostByRegion);
router.get('/by-resource-group', getCostByResourceGroup);
router.get('/top-resources', getTopResources);
router.get('/forecast', getForecast);

module.exports = router;
