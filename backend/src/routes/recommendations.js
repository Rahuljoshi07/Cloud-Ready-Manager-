const express = require('express');
const router = express.Router();
const { getRecommendations, updateRecommendationStatus } = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getRecommendations);
router.put('/:id', updateRecommendationStatus);

module.exports = router;
