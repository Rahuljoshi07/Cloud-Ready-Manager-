const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getResources, getResourceById, getTopExpensive, getIdleResources, getResourcesByGroup,
} = require('../controllers/resourceController');

const router = Router();

router.use(authenticate);
router.get('/', getResources);
router.get('/top-expensive', getTopExpensive);
router.get('/idle', getIdleResources);
router.get('/by-group', getResourcesByGroup);
router.get('/:id', getResourceById);

module.exports = router;
