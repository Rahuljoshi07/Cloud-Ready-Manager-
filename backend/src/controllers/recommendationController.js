const { generateRecommendations } = require('../services/azureMockService');

let recommendations = generateRecommendations();

const getRecommendations = (req, res) => {
  try {
    const { category, priority, status } = req.query;
    let filtered = [...recommendations];
    if (category) filtered = filtered.filter(r => r.category === category);
    if (priority) filtered = filtered.filter(r => r.priority === priority);
    if (status) filtered = filtered.filter(r => r.status === status);

    const totalSavings = filtered
      .filter(r => r.status === 'active')
      .reduce((s, r) => s + parseFloat(r.estimated_savings), 0);

    const summary = {
      total: recommendations.length,
      active: recommendations.filter(r => r.status === 'active').length,
      implemented: recommendations.filter(r => r.status === 'implemented').length,
      dismissed: recommendations.filter(r => r.status === 'dismissed').length,
      total_potential_savings: parseFloat(totalSavings.toFixed(2)),
      categories: [...new Set(recommendations.map(r => r.category))]
    };

    return res.json({ success: true, data: filtered, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateRecommendationStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'dismissed', 'implemented'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be: active, dismissed, or implemented' });
    }

    const idx = recommendations.findIndex(r => r.id === id || r.resource_id.includes(id));
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    recommendations[idx].status = status;
    return res.json({ success: true, message: `Recommendation marked as ${status}`, data: recommendations[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecommendations, updateRecommendationStatus };
