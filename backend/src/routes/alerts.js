const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAlerts, getAlertSummary, acknowledgeAlert, resolveAlert, deleteAlert, bulkResolve,
} = require('../controllers/alertController');

const router = Router();

router.use(authenticate);
router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.post('/bulk-resolve', bulkResolve);
router.put('/:id/acknowledge', acknowledgeAlert);
router.put('/:id/resolve', resolveAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
