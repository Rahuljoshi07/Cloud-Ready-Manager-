const PDFDocument = require('pdfkit');
const { CostRecord, Resource, Recommendation, Budget } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const BRAND_COLOR = '#0078d4'; // Azure blue
const DARK = '#1f2937';
const GRAY = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';

function drawHeader(doc, title, subtitle) {
  doc.rect(0, 0, doc.page.width, 80).fill(BRAND_COLOR);
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold').text(title, 40, 22);
  doc.fontSize(11).font('Helvetica').text(subtitle, 40, 50);
  doc.fillColor(DARK);
  doc.moveDown(4);
}

function drawSectionTitle(doc, text) {
  doc.moveDown(1);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(BRAND_COLOR).text(text);
  doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor(BRAND_COLOR).stroke();
  doc.moveDown(0.5);
  doc.fillColor(DARK).font('Helvetica');
}

function drawKeyValue(doc, label, value, y) {
  const startY = y || doc.y;
  doc.fontSize(10).font('Helvetica-Bold').fillColor(GRAY).text(label, 40, startY, { continued: false });
  doc.fontSize(11).font('Helvetica').fillColor(DARK).text(String(value), 40, doc.y);
  doc.moveDown(0.3);
}

function drawTable(doc, headers, rows) {
  const colWidth = (doc.page.width - 80) / headers.length;
  const startX = 40;
  let y = doc.y;

  // Header row
  doc.rect(startX, y, doc.page.width - 80, 20).fill(BRAND_COLOR);
  headers.forEach((h, i) => {
    doc
      .fillColor('white')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text(h, startX + i * colWidth + 4, y + 5, { width: colWidth - 8, ellipsis: true });
  });
  y += 20;

  rows.forEach((row, ri) => {
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 40;
    }
    doc.rect(startX, y, doc.page.width - 80, 18).fill(ri % 2 === 0 ? 'white' : LIGHT_GRAY);
    row.forEach((cell, i) => {
      doc
        .fillColor(DARK)
        .fontSize(9)
        .font('Helvetica')
        .text(String(cell), startX + i * colWidth + 4, y + 4, { width: colWidth - 8, ellipsis: true });
    });
    y += 18;
  });

  doc.y = y + 10;
  doc.fillColor(DARK);
}

/**
 * Generates a monthly cost PDF report.
 */
async function generateMonthlyReport(userId, month, year) {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const monthName = startDate.toLocaleString('default', { month: 'long' });

      const costRecords = await CostRecord.findAll({
        where: { date: { [Op.between]: [startDate, endDate] } },
        order: [['date', 'ASC']],
        raw: true,
      });

      const totalCost = costRecords.reduce((s, r) => s + parseFloat(r.amount), 0);

      // Cost by service
      const bySvc = {};
      costRecords.forEach((r) => {
        bySvc[r.service] = (bySvc[r.service] || 0) + parseFloat(r.amount);
      });
      const topServices = Object.entries(bySvc)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // Cost by resource group
      const byRg = {};
      costRecords.forEach((r) => {
        if (r.resourceGroup) byRg[r.resourceGroup] = (byRg[r.resourceGroup] || 0) + parseFloat(r.amount);
      });
      const topRgs = Object.entries(byRg).sort((a, b) => b[1] - a[1]).slice(0, 8);

      const recommendations = await Recommendation.findAll({
        where: { status: 'pending' },
        order: [['estimatedSavings', 'DESC']],
        limit: 10,
        raw: true,
      });
      const potentialSavings = recommendations.reduce((s, r) => s + parseFloat(r.estimatedSavings), 0);

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      drawHeader(doc, `Azure Cost Report — ${monthName} ${year}`, `Generated on ${new Date().toLocaleDateString()} | All amounts in USD`);

      // Summary section
      drawSectionTitle(doc, 'Executive Summary');
      const summaryRows = [
        ['Total Monthly Spend', `$${totalCost.toFixed(2)}`],
        ['Number of Services', String(Object.keys(bySvc).length)],
        ['Number of Resource Groups', String(Object.keys(byRg).length)],
        ['Cost Records Analyzed', String(costRecords.length)],
        ['Potential Monthly Savings', `$${potentialSavings.toFixed(2)}`],
        ['Pending Recommendations', String(recommendations.length)],
      ];
      summaryRows.forEach(([label, value]) => drawKeyValue(doc, label, value));

      // Top services
      drawSectionTitle(doc, 'Top 10 Services by Cost');
      drawTable(
        doc,
        ['Service', 'Monthly Cost (USD)', '% of Total'],
        topServices.map(([svc, cost]) => [svc, `$${cost.toFixed(2)}`, `${((cost / totalCost) * 100).toFixed(1)}%`])
      );

      // Top resource groups
      drawSectionTitle(doc, 'Cost by Resource Group');
      drawTable(
        doc,
        ['Resource Group', 'Monthly Cost (USD)', '% of Total'],
        topRgs.map(([rg, cost]) => [rg, `$${cost.toFixed(2)}`, `${((cost / totalCost) * 100).toFixed(1)}%`])
      );

      // Recommendations
      if (recommendations.length > 0) {
        drawSectionTitle(doc, 'Top Optimization Recommendations');
        drawTable(
          doc,
          ['Title', 'Type', 'Priority', 'Est. Savings/mo'],
          recommendations.map((r) => [r.title, r.type, r.priority, `$${parseFloat(r.estimatedSavings).toFixed(2)}`])
        );
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor(GRAY).text('This report was generated automatically by Azure Cost Monitoring Platform. Data reflects Azure Cost Management API records.', 40, doc.y, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates an optimization recommendations PDF report.
 */
async function generateOptimizationReport(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const recommendations = await Recommendation.findAll({
        where: { status: 'pending' },
        order: [['estimatedSavings', 'DESC']],
        raw: true,
      });

      const totalSavings = recommendations.reduce((s, r) => s + parseFloat(r.estimatedSavings), 0);
      const byType = {};
      recommendations.forEach((r) => {
        byType[r.type] = (byType[r.type] || 0) + parseFloat(r.estimatedSavings);
      });

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      drawHeader(doc, 'Azure Cost Optimization Report', `Generated on ${new Date().toLocaleDateString()} | Recommendations for cost reduction`);

      drawSectionTitle(doc, 'Savings Opportunity Summary');
      drawKeyValue(doc, 'Total Potential Monthly Savings', `$${totalSavings.toFixed(2)}`);
      drawKeyValue(doc, 'Total Annual Savings Potential', `$${(totalSavings * 12).toFixed(2)}`);
      drawKeyValue(doc, 'Total Recommendations', String(recommendations.length));

      if (Object.keys(byType).length > 0) {
        drawSectionTitle(doc, 'Savings by Recommendation Type');
        drawTable(
          doc,
          ['Type', 'Count', 'Total Savings/mo'],
          Object.entries(byType).map(([type, savings]) => [
            type,
            String(recommendations.filter((r) => r.type === type).length),
            `$${savings.toFixed(2)}`,
          ])
        );
      }

      drawSectionTitle(doc, 'All Recommendations');
      drawTable(
        doc,
        ['Title', 'Type', 'Priority', 'Resource Group', 'Est. Savings/mo'],
        recommendations.map((r) => [
          r.title,
          r.type,
          r.priority,
          r.resourceGroup || 'N/A',
          `$${parseFloat(r.estimatedSavings).toFixed(2)}`,
        ])
      );

      doc.moveDown(2);
      doc.fontSize(8).fillColor(GRAY).text('Estimated savings are projections based on current usage patterns. Actual savings may vary.', 40, doc.y, { align: 'center' });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateMonthlyReport, generateOptimizationReport };
