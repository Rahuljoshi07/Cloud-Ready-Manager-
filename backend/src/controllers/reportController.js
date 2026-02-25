const CostRecord = require('../models/CostRecord');
const Resource = require('../models/Resource');
const Alert = require('../models/Alert');
const Recommendation = require('../models/Recommendation');
const { generateCostReport } = require('../services/reportService');
const { monthOverMonthGrowth } = require('../services/forecastService');

const generateReport = async (req, res) => {
  try {
    const { format = 'json', period = 'monthly', subscription_id } = req.query;

    const filters = subscription_id ? { subscription_id } : {};

    const [
      costByService,
      costByRegion,
      dailyTrend,
      resources,
      alerts,
      recommendations,
    ] = await Promise.all([
      CostRecord.getCostByService(30),
      CostRecord.getCostByRegion(30),
      CostRecord.getDailyTrend(30),
      Resource.findAll(filters),
      Alert.findAll({ is_resolved: false }),
      Recommendation.findAll({ status: 'pending' }),
    ]);

    const totalCost = costByService.reduce((sum, s) => sum + parseFloat(s.total_cost), 0);
    const dailyAvg = dailyTrend.length > 0
      ? dailyTrend.reduce((s, d) => s + parseFloat(d.total_cost), 0) / dailyTrend.length
      : 0;

    // Get prev month for MoM
    const now = new Date();
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    const prevRecords = await CostRecord.findAll({ start_date: prevStart, end_date: prevEnd });
    const prevTotal = prevRecords.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const momChange = monthOverMonthGrowth(prevTotal, totalCost);

    const totalSavings = await Recommendation.getTotalSavings();

    const reportData = {
      title: `Azure Cloud Cost Report - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      period,
      generatedAt: new Date().toISOString(),
      summary: {
        total_cost: totalCost,
        daily_average: parseFloat(dailyAvg.toFixed(2)),
        active_resources: resources.filter(r => r.status === 'running').length,
        active_alerts: alerts.length,
        potential_savings: totalSavings,
        mom_change: momChange,
      },
      costByService,
      costByRegion,
      dailyTrend,
      topResources: resources
        .sort((a, b) => parseFloat(b.monthly_cost) - parseFloat(a.monthly_cost))
        .slice(0, 20),
      recommendations,
      alerts,
    };

    if (format === 'pdf') {
      const pdfBuffer = await generateCostReport(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="azure-cost-report-${Date.now()}.pdf"`);
      return res.send(pdfBuffer);
    }

    res.json(reportData);
  } catch (error) {
    console.error('generateReport error:', error);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
};

const getReportSummary = async (req, res) => {
  try {
    const [totalMonthly, activeResources, activeAlerts, totalSavings] = await Promise.all([
      CostRecord.getTotalMonthly(),
      Resource.countActive(),
      Alert.countActive(),
      Recommendation.getTotalSavings(),
    ]);

    const dailyTrend = await CostRecord.getDailyTrend(30);
    const dailyAvg = dailyTrend.length > 0
      ? dailyTrend.reduce((s, d) => s + parseFloat(d.total_cost), 0) / dailyTrend.length
      : 0;

    res.json({
      total_monthly_cost: totalMonthly,
      daily_average: parseFloat(dailyAvg.toFixed(2)),
      active_resources: activeResources,
      active_alerts: activeAlerts,
      total_potential_savings: totalSavings,
    });
  } catch (error) {
    console.error('getReportSummary error:', error);
    res.status(500).json({ error: 'Failed to get report summary.' });
  }
};

module.exports = { generateReport, getReportSummary };
