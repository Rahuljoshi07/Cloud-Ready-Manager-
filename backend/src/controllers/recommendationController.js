const Recommendation = require('../models/Recommendation');

const getRecommendations = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
    };
    const recommendations = await Recommendation.findAll(filters);
    const totalSavings = await Recommendation.getTotalSavings();
    res.json({ data: recommendations, count: recommendations.length, total_potential_savings: totalSavings });
  } catch (error) {
    console.error('getRecommendations error:', error);
    res.status(500).json({ error: 'Failed to retrieve recommendations.' });
  }
};

const getRecommendationById = async (req, res) => {
  try {
    const rec = await Recommendation.findById(req.params.id);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });
    res.json(rec);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve recommendation.' });
  }
};

const createRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.create(req.body);
    res.status(201).json(rec);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recommendation.' });
  }
};

const updateRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.update(req.params.id, req.body);
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });
    res.json(rec);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update recommendation.' });
  }
};

const applyRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.update(req.params.id, { status: 'applied' });
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });
    res.json({ message: 'Recommendation marked as applied.', recommendation: rec });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply recommendation.' });
  }
};

const dismissRecommendation = async (req, res) => {
  try {
    const rec = await Recommendation.update(req.params.id, { status: 'dismissed' });
    if (!rec) return res.status(404).json({ error: 'Recommendation not found.' });
    res.json({ message: 'Recommendation dismissed.', recommendation: rec });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dismiss recommendation.' });
  }
};

const deleteRecommendation = async (req, res) => {
  try {
    await Recommendation.delete(req.params.id);
    res.json({ message: 'Recommendation deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete recommendation.' });
  }
};

module.exports = {
  getRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendation,
  applyRecommendation,
  dismissRecommendation,
  deleteRecommendation,
};
