const { Alert } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getAlerts(req, res) {
  try {
    const { status, type, severity, page = 1, pageSize = 20 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;
    const { count, rows } = await Alert.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, {
      alerts: rows,
      pagination: { total: count, page: parseInt(page, 10), pageSize: limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getAlertSummary(req, res) {
  try {
    const counts = await Alert.findAll({
      where: { userId: req.user.id, status: 'active' },
      attributes: ['severity', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      group: ['severity'],
      raw: true,
    });
    const summary = { critical: 0, high: 0, medium: 0, low: 0 };
    counts.forEach((c) => { summary[c.severity] = parseInt(c.count, 10); });
    return successResponse(res, { summary });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function acknowledgeAlert(req, res) {
  try {
    const alert = await Alert.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!alert) return errorResponse(res, 'Alert not found', 404);
    if (alert.status !== 'active') return errorResponse(res, 'Alert is not active', 400);
    await alert.update({ status: 'acknowledged', acknowledgedAt: new Date() });
    return successResponse(res, { alert });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function resolveAlert(req, res) {
  try {
    const alert = await Alert.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!alert) return errorResponse(res, 'Alert not found', 404);
    await alert.update({ status: 'resolved', resolvedAt: new Date() });
    return successResponse(res, { alert });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function deleteAlert(req, res) {
  try {
    const alert = await Alert.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!alert) return errorResponse(res, 'Alert not found', 404);
    await alert.destroy();
    return successResponse(res, { message: 'Alert deleted' });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function bulkResolve(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return errorResponse(res, 'Alert IDs array required', 400);
    const [count] = await Alert.update(
      { status: 'resolved', resolvedAt: new Date() },
      { where: { id: { [Op.in]: ids }, userId: req.user.id } }
    );
    return successResponse(res, { resolved: count });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getAlerts, getAlertSummary, acknowledgeAlert, resolveAlert, deleteAlert, bulkResolve };
