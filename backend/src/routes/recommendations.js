const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getRecommendations, getRecommendationById, applyRecommendation, dismissRecommendation, getSavingsSummary,
} = require('../controllers/recommendationController');

const router = Router();

router.use(authenticate);
router.get('/', getRecommendations);
router.get('/savings-summary', getSavingsSummary);
router.get('/:id', getRecommendationById);
router.put('/:id/apply', applyRecommendation);
router.put('/:id/dismiss', dismissRecommendation);

module.exports = router;
