const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getResources, getResourceById, createResource,
  updateResource, deleteResource, getResourceStats,
} = require('../controllers/resourceController');

router.use(auth);
router.get('/', getResources);
router.get('/stats', getResourceStats);
router.get('/:id', getResourceById);
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

module.exports = router;
