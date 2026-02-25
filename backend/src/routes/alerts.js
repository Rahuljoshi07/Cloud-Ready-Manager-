const express = require('express');
const router = express.Router();
const { getAlerts, createAlert, updateAlert, deleteAlert } = require('../controllers/alertController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
