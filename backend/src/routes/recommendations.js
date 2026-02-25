const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getRecommendations, getRecommendationById, createRecommendation,
  updateRecommendation, applyRecommendation, dismissRecommendation, deleteRecommendation,
} = require('../controllers/recommendationController');

router.use(auth);
router.get('/', getRecommendations);
router.get('/:id', getRecommendationById);
router.post('/', createRecommendation);
router.put('/:id', updateRecommendation);
router.put('/:id/apply', applyRecommendation);
router.put('/:id/dismiss', dismissRecommendation);
router.delete('/:id', deleteRecommendation);

module.exports = router;
