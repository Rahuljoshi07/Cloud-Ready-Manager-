const { CostRecord } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const azureService = require('../services/azureService');
const { detectAnomalies, calculateTrend } = require('../services/anomalyDetectionService');
const { forecastCosts, calculateMonthlyForecast } = require('../services/forecastingService');
const { successResponse, errorResponse, format, subDays } = require('../utils/helpers');

function getSubscriptionId(req) {
  return req.query.subscriptionId || (req.user.subscriptions && req.user.subscriptions[0]) || 'sub-001-prod';
}

async function getDashboard(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = subDays(now, 30);

    const [monthlyCosts, last30Days] = await Promise.all([
      CostRecord.findAll({
        where: { subscriptionId, date: { [Op.gte]: startOfMonth } },
        raw: true,
      }),
      CostRecord.findAll({
        where: { subscriptionId, date: { [Op.gte]: thirtyDaysAgo } },
        raw: true,
      }),
    ]);

    const totalMonthlyCost = monthlyCosts.reduce((s, r) => s + parseFloat(r.amount), 0);

    // Daily trend for last 30 days
    const dailyTotals = {};
    last30Days.forEach((r) => {
      dailyTotals[r.date] = (dailyTotals[r.date] || 0) + parseFloat(r.amount);
    });
    const dailyTrend = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Cost by service (current month)
    const bySvc = {};
    monthlyCosts.forEach((r) => { bySvc[r.service] = (bySvc[r.service] || 0) + parseFloat(r.amount); });
    const costByService = Object.entries(bySvc)
      .map(([service, amount]) => ({ service, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Cost by region
    const byRegion = {};
    monthlyCosts.forEach((r) => { if (r.region) byRegion[r.region] = (byRegion[r.region] || 0) + parseFloat(r.amount); });
    const costByRegion = Object.entries(byRegion)
      .map(([region, amount]) => ({ region, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Cost by resource group
    const byRg = {};
    monthlyCosts.forEach((r) => { if (r.resourceGroup) byRg[r.resourceGroup] = (byRg[r.resourceGroup] || 0) + parseFloat(r.amount); });
    const costByResourceGroup = Object.entries(byRg)
      .map(([resourceGroup, amount]) => ({ resourceGroup, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount);

    // Month-over-month comparison
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthCosts = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.between]: [prevMonth, prevMonthEnd] } },
      raw: true,
    });
    const prevMonthTotal = prevMonthCosts.reduce((s, r) => s + parseFloat(r.amount), 0);
    const momChange = prevMonthTotal > 0 ? ((totalMonthlyCost - prevMonthTotal) / prevMonthTotal) * 100 : 0;

    const forecast = calculateMonthlyForecast(
      Object.entries(dailyTotals).map(([date, amount]) => ({ date, amount }))
    );
    const trend = calculateTrend(dailyTrend);

    return successResponse(res, {
      summary: {
        totalMonthlyCost: parseFloat(totalMonthlyCost.toFixed(2)),
        prevMonthTotal: parseFloat(prevMonthTotal.toFixed(2)),
        momChange: parseFloat(momChange.toFixed(1)),
        projectedMonthly: forecast.projectedMonthly,
        currency: 'USD',
        subscriptionId,
      },
      dailyTrend,
      costByService,
      costByRegion,
      costByResourceGroup,
      forecast,
      trend,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getCostTrend(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.days || '30', 10);
    const startDate = subDays(new Date(), days);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const dailyTotals = {};
    records.forEach((r) => { dailyTotals[r.date] = (dailyTotals[r.date] || 0) + parseFloat(r.amount); });
    const dailyData = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const trend = calculateTrend(dailyData);
    const anomalies = detectAnomalies(records);
    const forecast = forecastCosts(dailyData, 14);

    return successResponse(res, { dailyData, trend, anomalies: anomalies.slice(0, 10), forecast });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getCostByService(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.days || '30', 10);
    const startDate = subDays(new Date(), days);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const bySvc = {};
    records.forEach((r) => { bySvc[r.service] = (bySvc[r.service] || 0) + parseFloat(r.amount); });

    const result = Object.entries(bySvc)
      .map(([service, amount]) => ({ service, amount: parseFloat(amount.toFixed(2)), currency: 'USD' }))
      .sort((a, b) => b.amount - a.amount);

    const total = result.reduce((s, r) => s + r.amount, 0);
    result.forEach((r) => { r.percentage = parseFloat(((r.amount / total) * 100).toFixed(1)); });

    return successResponse(res, { services: result, total: parseFloat(total.toFixed(2)), period: days });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getCostByRegion(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.days || '30', 10);
    const startDate = subDays(new Date(), days);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const byRegion = {};
    records.forEach((r) => { if (r.region) byRegion[r.region] = (byRegion[r.region] || 0) + parseFloat(r.amount); });
    const total = Object.values(byRegion).reduce((s, v) => s + v, 0);
    const result = Object.entries(byRegion)
      .map(([region, amount]) => ({
        region,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(((amount / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount);

    return successResponse(res, { regions: result, total: parseFloat(total.toFixed(2)), period: days });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getCostByResourceGroup(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.days || '30', 10);
    const startDate = subDays(new Date(), days);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const byRg = {};
    records.forEach((r) => { if (r.resourceGroup) byRg[r.resourceGroup] = (byRg[r.resourceGroup] || 0) + parseFloat(r.amount); });
    const total = Object.values(byRg).reduce((s, v) => s + v, 0);
    const result = Object.entries(byRg)
      .map(([resourceGroup, amount]) => ({
        resourceGroup,
        amount: parseFloat(amount.toFixed(2)),
        percentage: parseFloat(((amount / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount);

    return successResponse(res, { resourceGroups: result, total: parseFloat(total.toFixed(2)), period: days });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getForecast(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.forecastDays || '30', 10);
    const historicalDays = parseInt(req.query.historicalDays || '60', 10);
    const startDate = subDays(new Date(), historicalDays);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const dailyTotals = {};
    records.forEach((r) => { dailyTotals[r.date] = (dailyTotals[r.date] || 0) + parseFloat(r.amount); });
    const historicalData = Object.entries(dailyTotals)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const forecast = forecastCosts(historicalData, days);
    const monthlyForecast = calculateMonthlyForecast(historicalData.slice(-30));

    return successResponse(res, { historicalData, forecast, monthlyForecast });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function getTagAnalysis(req, res) {
  try {
    const subscriptionId = getSubscriptionId(req);
    const days = parseInt(req.query.days || '30', 10);
    const startDate = subDays(new Date(), days);

    const records = await CostRecord.findAll({
      where: { subscriptionId, date: { [Op.gte]: startDate } },
      raw: true,
    });

    const byEnvironment = {};
    const byTeam = {};
    records.forEach((r) => {
      const tags = r.tags || {};
      if (tags.environment) byEnvironment[tags.environment] = (byEnvironment[tags.environment] || 0) + parseFloat(r.amount);
      if (tags.team) byTeam[tags.team] = (byTeam[tags.team] || 0) + parseFloat(r.amount);
    });

    return successResponse(res, {
      byEnvironment: Object.entries(byEnvironment).map(([tag, amount]) => ({ tag, amount: parseFloat(amount.toFixed(2)) })),
      byTeam: Object.entries(byTeam).map(([tag, amount]) => ({ tag, amount: parseFloat(amount.toFixed(2)) })),
      period: days,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getDashboard, getCostTrend, getCostByService, getCostByRegion, getCostByResourceGroup, getForecast, getTagAnalysis };
