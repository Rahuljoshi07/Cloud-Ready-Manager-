const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { generateReport, getReportSummary } = require('../controllers/reportController');

router.use(auth);
router.get('/summary', getReportSummary);
router.get('/generate', generateReport);

module.exports = router;
