const { generateMonthlyReport, generateOptimizationReport } = require('../services/reportService');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getReports(req, res) {
  const now = new Date();
  const availableReports = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    availableReports.push({
      id: `monthly-${d.getFullYear()}-${d.getMonth() + 1}`,
      type: 'monthly',
      name: `Monthly Cost Report — ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      downloadUrl: `/api/v1/reports/monthly/${d.getFullYear()}/${d.getMonth() + 1}`,
    });
  }
  availableReports.push({
    id: 'optimization-current',
    type: 'optimization',
    name: 'Cost Optimization Report',
    downloadUrl: '/api/v1/reports/optimization',
  });
  return successResponse(res, { reports: availableReports });
}

async function downloadMonthlyReport(req, res) {
  try {
    const month = parseInt(req.params.month, 10);
    const year = parseInt(req.params.year, 10);
    if (!month || !year || month < 1 || month > 12) {
      return errorResponse(res, 'Invalid month or year', 400);
    }
    const buffer = await generateMonthlyReport(req.user.id, month, year);
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="azure-cost-report-${monthName}-${year}.pdf"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

async function downloadOptimizationReport(req, res) {
  try {
    const buffer = await generateOptimizationReport(req.user.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="azure-optimization-report.pdf"');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (err) {
    return errorResponse(res, err.message);
  }
}

module.exports = { getReports, downloadMonthlyReport, downloadOptimizationReport };
