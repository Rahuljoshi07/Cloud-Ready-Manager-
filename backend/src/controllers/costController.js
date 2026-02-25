const CostRecord = require('../models/CostRecord');
const { detectAnomalies } = require('../services/anomalyService');
const { forecastCosts, projectEndOfMonth, monthOverMonthGrowth } = require('../services/forecastService');

const getCosts = async (req, res) => {
  try {
    const filters = {
      subscription_id: req.query.subscription_id,
      resource_group: req.query.resource_group,
      service_name: req.query.service_name,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };
    const records = await CostRecord.findAll(filters);
    res.json({ data: records, count: records.length });
  } catch (error) {
    console.error('getCosts error:', error);
    res.status(500).json({ error: 'Failed to retrieve cost records.' });
  }
};

const getCostById = async (req, res) => {
  try {
    const record = await CostRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve record.' });
  }
};

const getDailyTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    const trend = await CostRecord.getDailyTrend(days);
    res.json({ data: trend, days });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve daily trend.' });
  }
};

const getCostByService = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    const data = await CostRecord.getCostByService(days);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve costs by service.' });
  }
};

const getCostByRegion = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    const data = await CostRecord.getCostByRegion(days);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve costs by region.' });
  }
};

const getSummary = async (req, res) => {
  try {
    const totalMonthly = await CostRecord.getTotalMonthly();
    const dailyTrend = await CostRecord.getDailyTrend(30);

    const now = new Date();
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projected = projectEndOfMonth(totalMonthly, daysElapsed, daysInMonth);

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const prevRecords = await CostRecord.findAll({ start_date: prevMonthStart, end_date: prevMonthEnd });
    const prevTotal = prevRecords.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const momChange = monthOverMonthGrowth(prevTotal, totalMonthly);

    res.json({
      total_monthly: totalMonthly,
      daily_average: dailyTrend.length > 0
        ? parseFloat((dailyTrend.reduce((s, d) => s + parseFloat(d.total_cost), 0) / dailyTrend.length).toFixed(2))
        : 0,
      projected_monthly: projected,
      mom_change: momChange,
      daily_trend: dailyTrend,
    });
  } catch (error) {
    console.error('getSummary error:', error);
    res.status(500).json({ error: 'Failed to retrieve cost summary.' });
  }
};

const getAnomalies = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    const trend = await CostRecord.getDailyTrend(days);
    const anomalies = detectAnomalies(trend);
    res.json({ data: anomalies, count: anomalies.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to detect anomalies.' });
  }
};

const getForecast = async (req, res) => {
  try {
    const forecastDays = parseInt(req.query.days || '30');
    const historicalDays = parseInt(req.query.historical_days || '60');
    const trend = await CostRecord.getDailyTrend(historicalDays);
    const forecast = forecastCosts(trend, forecastDays);
    res.json({ data: forecast, forecast_days: forecastDays });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast.' });
  }
};

const createCostRecord = async (req, res) => {
  try {
    const record = await CostRecord.create(req.body);
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create record.' });
  }
};

module.exports = {
  getCosts,
  getCostById,
  getDailyTrend,
  getCostByService,
  getCostByRegion,
  getSummary,
  getAnomalies,
  getForecast,
  createCostRecord,
};
