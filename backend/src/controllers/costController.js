const azureMock = require('../services/azureMockService');
const { forecastCosts, calculateMonthlyForecast } = require('../services/forecastService');
const { getAnomalySummary } = require('../services/anomalyDetectionService');

const getMonthlyCost = (req, res) => {
  try {
    const costs = azureMock.generateMonthlyCosts();
    // Aggregate by date
    const byDate = costs.reduce((acc, c) => {
      if (!acc[c.usage_date]) acc[c.usage_date] = { date: c.usage_date, total: 0 };
      acc[c.usage_date].total += c.amount;
      return acc;
    }, {});
    const dailyData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, total: parseFloat(d.total.toFixed(2)) }));

    const totalMonthly = dailyData.reduce((s, d) => s + d.total, 0);
    const dailyAvg = totalMonthly / dailyData.length;
    const anomalySummary = getAnomalySummary(dailyData, 'total');

    return res.json({
      success: true,
      data: {
        daily_costs: dailyData,
        total_monthly: parseFloat(totalMonthly.toFixed(2)),
        daily_average: parseFloat(dailyAvg.toFixed(2)),
        anomalies: anomalySummary.anomalies,
        anomaly_count: anomalySummary.anomaly_count
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDailyCosts = (req, res) => {
  try {
    const costs = azureMock.generateMonthlyCosts();
    const byDate = costs.reduce((acc, c) => {
      if (!acc[c.usage_date]) acc[c.usage_date] = { date: c.usage_date, total: 0, services: {} };
      acc[c.usage_date].total += c.amount;
      if (!acc[c.usage_date].services[c.service_name]) acc[c.usage_date].services[c.service_name] = 0;
      acc[c.usage_date].services[c.service_name] += c.amount;
      return acc;
    }, {});
    const result = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCostByService = (req, res) => {
  try {
    const data = azureMock.generateCostByService();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCostByRegion = (req, res) => {
  try {
    const data = azureMock.generateCostByRegion();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getCostByResourceGroup = (req, res) => {
  try {
    const data = azureMock.generateCostByResourceGroup();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTopResources = (req, res) => {
  try {
    const data = azureMock.generateTopExpensiveResources();
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getForecast = (req, res) => {
  try {
    const costs = azureMock.generateMonthlyCosts();
    const byDate = costs.reduce((acc, c) => {
      if (!acc[c.usage_date]) acc[c.usage_date] = { date: c.usage_date, total: 0 };
      acc[c.usage_date].total += c.amount;
      return acc;
    }, {});
    const dailyData = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, total: parseFloat(d.total.toFixed(2)) }));

    const daysToForecast = parseInt(req.query.days) || 30;
    const forecasts = forecastCosts(dailyData, daysToForecast);
    const monthlyForecast = calculateMonthlyForecast(dailyData);

    return res.json({
      success: true,
      data: {
        historical: dailyData,
        forecast: forecasts,
        monthly_forecast: monthlyForecast
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSummary = (req, res) => {
  try {
    const costs = azureMock.generateMonthlyCosts();
    const resources = azureMock.generateResources();
    const byDate = costs.reduce((acc, c) => {
      if (!acc[c.usage_date]) acc[c.usage_date] = { total: 0 };
      acc[c.usage_date].total += c.amount;
      return acc;
    }, {});
    const dailyTotals = Object.values(byDate);
    const totalMonthly = dailyTotals.reduce((s, d) => s + d.total, 0);
    const dailyAvg = totalMonthly / dailyTotals.length;
    const activeResources = resources.filter(r => r.status === 'running').length;

    return res.json({
      success: true,
      data: {
        total_monthly_cost: parseFloat(totalMonthly.toFixed(2)),
        daily_average: parseFloat(dailyAvg.toFixed(2)),
        active_resources: activeResources,
        total_resources: resources.length,
        currency: 'USD',
        subscription_id: azureMock.SUBSCRIPTION_ID
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMonthlyCost,
  getDailyCosts,
  getCostByService,
  getCostByRegion,
  getCostByResourceGroup,
  getTopResources,
  getForecast,
  getSummary
};
