const { Resource } = require('../models');
const { Op } = require('sequelize');
const { successResponse, errorResponse } = require('../utils/helpers');

function getSubscriptionId(req) {
  return req.query.subscriptionId || (req.user.subscriptions && req.user.subscriptions[0]) || 'sub-001-prod';
}

async function getResources(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const { resourceType, resourceGroup, status, region, page = 1, pageSize = 20 } = req.query;

    const where = { subscriptionId };
    if (resourceType) where.resourceType = resourceType;
    if (resourceGroup) where.resourceGroup = resourceGroup;
    if (status) where.status = status;
    if (region) where.region = region;

    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const { count, rows } = await Resource.findAndCountAll({
      where,
      limit,
      offset,
      order: [['costPerDay', 'DESC']],
    });

    return successResponse(res, {
      resources: rows,
      pagination: { total: count, page: parseInt(page, 10), pageSize: limit, totalPages: Math.ceil(count / limit) },
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getResourceById(req, res) {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) return errorResponse(res, 'Resource not found', 404);
    return successResponse(res, { resource });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getTopExpensive(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const limit = parseInt(req.query.limit || '10', 10);

    const resources = await Resource.findAll({
      where: { subscriptionId },
      order: [['costPerDay', 'DESC']],
      limit,
    });

    return successResponse(res, { resources });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getIdleResources(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const cpuThreshold = parseFloat(req.query.cpuThreshold || '10');
    const memThreshold = parseFloat(req.query.memThreshold || '20');

    const resources = await Resource.findAll({
      where: {
        subscriptionId,
        cpuUtilization: { [Op.lt]: cpuThreshold },
        memoryUtilization: { [Op.lt]: memThreshold },
        status: 'running',
      },
      order: [['costPerDay', 'DESC']],
    });

    const totalWastedCost = resources.reduce((s, r) => s + parseFloat(r.costPerDay), 0);

    return successResponse(res, {
      resources,
      count: resources.length,
      estimatedWastedCostPerDay: parseFloat(totalWastedCost.toFixed(2)),
      estimatedWastedCostPerMonth: parseFloat((totalWastedCost * 30).toFixed(2)),
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getResourcesByGroup(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const resources = await Resource.findAll({ where: { subscriptionId } });

    const groups = {};
    resources.forEach((r) => {
      const rg = r.resourceGroup;
      if (!groups[rg]) groups[rg] = { resourceGroup: rg, count: 0, totalCostPerDay: 0, types: {} };
      groups[rg].count++;
      groups[rg].totalCostPerDay += parseFloat(r.costPerDay);
      groups[rg].types[r.resourceType] = (groups[rg].types[r.resourceType] || 0) + 1;
    });

    const result = Object.values(groups).map((g) => ({
      ...g,
      totalCostPerDay: parseFloat(g.totalCostPerDay.toFixed(4)),
      totalCostPerMonth: parseFloat((g.totalCostPerDay * 30).toFixed(2)),
    }));

    return successResponse(res, { resourceGroups: result });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getResources, getResourceById, getTopExpensive, getIdleResources, getResourcesByGroup };
