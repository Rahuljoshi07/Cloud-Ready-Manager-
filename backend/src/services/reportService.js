const PDFDocument = require('pdfkit');

/**
 * Generate a PDF cost report
 * @param {Object} reportData - Data to include in report
 * @returns {Buffer} PDF buffer
 */
async function generateCostReport(reportData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const {
        title = 'Azure Cost Report',
        period = 'Monthly',
        generatedAt = new Date().toISOString(),
        summary = {},
        costByService = [],
        costByRegion = [],
        topResources = [],
        recommendations = [],
      } = reportData;

      // ── Header ────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 80).fill('#0078d4');
      doc.fill('white').fontSize(22).text(title, 50, 22, { align: 'left' });
      doc.fontSize(11).text(`${period} Report  •  Generated: ${new Date(generatedAt).toLocaleString()}`, 50, 52);

      doc.fill('black').moveDown(3);

      // ── Summary KPIs ─────────────────────────────────────────
      doc.fontSize(16).fillColor('#0078d4').text('Executive Summary', 50, 100);
      doc.moveTo(50, 118).lineTo(545, 118).stroke('#0078d4');
      doc.moveDown(0.5);

      const kpis = [
        { label: 'Total Monthly Cost', value: `$${(summary.total_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'Daily Average', value: `$${(summary.daily_average || 0).toFixed(2)}` },
        { label: 'Active Resources', value: String(summary.active_resources || 0) },
        { label: 'Active Alerts', value: String(summary.active_alerts || 0) },
        { label: 'Potential Savings', value: `$${(summary.potential_savings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
        { label: 'MoM Change', value: `${summary.mom_change >= 0 ? '+' : ''}${(summary.mom_change || 0).toFixed(1)}%` },
      ];

      let kpiY = doc.y + 10;
      kpis.forEach((kpi, i) => {
        if (i % 3 === 0 && i > 0) {
          kpiY += 60;
        }
        const col = i % 3;
        const x = 50 + col * 165;
        doc.rect(x, kpiY, 155, 50).fill('#f0f4ff').stroke('#c0d0ff');
        doc.fillColor('#555').fontSize(9).text(kpi.label, x + 8, kpiY + 8);
        doc.fillColor('#0078d4').fontSize(15).font('Helvetica-Bold').text(kpi.value, x + 8, kpiY + 22);
        doc.font('Helvetica');
      });

      doc.y = kpiY + 75;

      // ── Cost by Service ──────────────────────────────────────
      doc.fontSize(14).fillColor('#0078d4').text('Cost by Service', 50, doc.y + 10);
      doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke('#0078d4');
      doc.moveDown(0.5);

      if (costByService.length > 0) {
        const maxCost = Math.max(...costByService.map(s => parseFloat(s.total_cost)));
        costByService.slice(0, 10).forEach((svc) => {
          const barWidth = maxCost > 0 ? (parseFloat(svc.total_cost) / maxCost) * 300 : 0;
          const y = doc.y + 5;
          doc.fillColor('#555').fontSize(9).text(svc.service_name, 50, y, { width: 120 });
          doc.rect(175, y, barWidth, 12).fill('#0078d4');
          doc.fillColor('#333').fontSize(9).text(`$${parseFloat(svc.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, y);
          doc.moveDown(0.8);
        });
      } else {
        doc.fontSize(10).fillColor('#888').text('No service cost data available.');
      }

      // ── Cost by Region ───────────────────────────────────────
      doc.addPage();
      doc.fontSize(14).fillColor('#0078d4').text('Cost by Region', 50, 50);
      doc.moveTo(50, 66).lineTo(545, 66).stroke('#0078d4');
      doc.moveDown(0.5);

      if (costByRegion.length > 0) {
        costByRegion.slice(0, 8).forEach((reg) => {
          const y = doc.y + 5;
          doc.fillColor('#555').fontSize(9).text(reg.region, 50, y, { width: 140 });
          doc.fillColor('#0078d4').fontSize(10).font('Helvetica-Bold')
            .text(`$${parseFloat(reg.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 200, y);
          doc.font('Helvetica');
          doc.moveDown(0.8);
        });
      }

      // ── Top Resources ────────────────────────────────────────
      doc.fontSize(14).fillColor('#0078d4').text('Top Resources by Cost', 50, doc.y + 20);
      doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke('#0078d4');
      doc.moveDown(0.5);

      if (topResources.length > 0) {
        // Table header
        doc.fillColor('white').rect(50, doc.y, 495, 20).fill('#0078d4');
        const headerY = doc.y + 5;
        ['Resource Name', 'Type', 'Region', 'Status', 'Monthly Cost'].forEach((h, i) => {
          const cols = [50, 190, 300, 380, 460];
          doc.fillColor('white').fontSize(9).font('Helvetica-Bold').text(h, cols[i], headerY);
        });
        doc.font('Helvetica');
        doc.moveDown(1.2);

        topResources.slice(0, 10).forEach((res, i) => {
          const y = doc.y;
          if (i % 2 === 0) doc.rect(50, y - 3, 495, 18).fill('#f8f9ff').stroke('#eee');
          doc.fillColor('#333').fontSize(8);
          doc.text(res.name || 'N/A', 50, y, { width: 135 });
          doc.text((res.type || '').split('/').pop() || 'N/A', 190, y, { width: 105 });
          doc.text(res.region || 'N/A', 300, y, { width: 75 });
          doc.text(res.status || 'N/A', 380, y, { width: 75 });
          doc.fillColor('#0078d4').font('Helvetica-Bold')
            .text(`$${parseFloat(res.monthly_cost || 0).toFixed(2)}`, 460, y);
          doc.font('Helvetica');
          doc.moveDown(0.9);
        });
      }

      // ── Recommendations ──────────────────────────────────────
      if (recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(14).fillColor('#0078d4').text('Optimization Recommendations', 50, 50);
        doc.moveTo(50, 66).lineTo(545, 66).stroke('#0078d4');
        doc.moveDown(0.5);

        recommendations.slice(0, 8).forEach((rec) => {
          const y = doc.y + 5;
          doc.rect(50, y, 495, 55).fill('#fff8e1').stroke('#ffcc02');
          doc.fillColor('#e65100').fontSize(10).font('Helvetica-Bold').text(rec.type?.replace(/_/g, ' ').toUpperCase(), 60, y + 6);
          doc.fillColor('#333').font('Helvetica').fontSize(9).text(rec.description, 60, y + 20, { width: 375 });
          doc.fillColor('#2e7d32').fontSize(10).font('Helvetica-Bold')
            .text(`Save $${parseFloat(rec.potential_savings || 0).toFixed(2)}/mo`, 430, y + 18);
          doc.font('Helvetica');
          doc.moveDown(3.8);
        });
      }

      // ── Footer ───────────────────────────────────────────────
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(pages.start + i);
        doc.fillColor('#aaa').fontSize(8)
          .text(`Azure Cost Monitoring Platform  |  Page ${i + 1} of ${pages.count}  |  Confidential`,
            50, doc.page.height - 30, { align: 'center', width: doc.page.width - 100 });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateCostReport };
