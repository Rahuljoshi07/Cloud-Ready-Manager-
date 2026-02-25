const { Recommendation } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getRecommendations(req, res) {
  try {
    const subscriptionId = req.query.subscriptionId || (req.user.subscriptions && req.user.subscriptions[0]) || 'sub-001-prod';
    const { status, type, priority, page = 1, pageSize = 20 } = req.query;
    const where = { subscriptionId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
    const { count, rows } = await Recommendation.findAndCountAll({
      where,
      limit,
      offset,
      order: [['estimatedSavings', 'DESC']],
    });

    const totalSavings = await Recommendation.findAll({
      where: { subscriptionId, status: 'pending' },
      attributes: [[require('sequelize').fn('SUM', require('sequelize').col('estimatedSavings')), 'total']],
      raw: true,
    });

    return successResponse(res, {
      recommendations: rows,
      pagination: { total: count, page: parseInt(page, 10), pageSize: limit, totalPages: Math.ceil(count / limit) },
      totalPotentialSavings: parseFloat(totalSavings[0]?.total || 0).toFixed(2),
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getRecommendationById(req, res) {
  try {
    const rec = await Recommendation.findByPk(req.params.id);
    if (!rec) return errorResponse(res, 'Recommendation not found', 404);
    return successResponse(res, { recommendation: rec });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function applyRecommendation(req, res) {
  try {
    const rec = await Recommendation.findByPk(req.params.id);
    if (!rec) return errorResponse(res, 'Recommendation not found', 404);
    if (rec.status !== 'pending') return errorResponse(res, 'Recommendation already processed', 400);
    await rec.update({ status: 'applied', appliedAt: new Date() });
    return successResponse(res, { recommendation: rec });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function dismissRecommendation(req, res) {
  try {
    const rec = await Recommendation.findByPk(req.params.id);
    if (!rec) return errorResponse(res, 'Recommendation not found', 404);
    if (rec.status !== 'pending') return errorResponse(res, 'Recommendation already processed', 400);
    await rec.update({ status: 'dismissed', dismissedAt: new Date() });
    return successResponse(res, { recommendation: rec });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getSavingsSummary(req, res) {
  try {
    const subscriptionId = req.query.subscriptionId || (req.user.subscriptions && req.user.subscriptions[0]) || 'sub-001-prod';
    const rows = await Recommendation.findAll({
      where: { subscriptionId, status: 'pending' },
      attributes: ['type', 'priority', [require('sequelize').fn('SUM', require('sequelize').col('estimatedSavings')), 'savings'], [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['type', 'priority'],
      raw: true,
    });
    return successResponse(res, { summary: rows });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getRecommendations, getRecommendationById, applyRecommendation, dismissRecommendation, getSavingsSummary };
