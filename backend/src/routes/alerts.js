const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAlerts, getAlertById, createAlert, resolveAlert,
  deleteAlert, getAlertSummary,
} = require('../controllers/alertController');

router.use(auth);
router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.get('/:id', getAlertById);
router.post('/', createAlert);
router.put('/:id/resolve', resolveAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
