const nodemailer = require('nodemailer');
const axios = require('axios');
const { User, Budget, Alert, CostRecord } = require('../models');
const { Op } = require('sequelize');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });
}

/**
 * Sends an email alert to a user.
 */
async function sendEmailAlert(userId, alert) {
  if (!process.env.SMTP_USER) {
    console.log('[NotificationService] Email not configured, skipping:', alert.title);
    return { sent: false, reason: 'SMTP not configured' };
  }

  try {
    const user = await User.findByPk(userId);
    if (!user || !user.notificationPreferences?.email) return { sent: false, reason: 'Email disabled' };

    const transporter = createTransporter();
    const severityColors = { low: '#3b82f6', medium: '#f59e0b', high: '#ef4444', critical: '#7c3aed' };
    const color = severityColors[alert.severity] || '#6b7280';

    await transporter.sendMail({
      from: `"Azure Cost Monitor" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${color}; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Azure Cost Monitor Alert</h2>
            <span style="font-size: 14px; text-transform: uppercase;">${alert.severity} severity</span>
          </div>
          <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
            <h3 style="color: #111827;">${alert.title}</h3>
            <p style="color: #374151;">${alert.message}</p>
            ${alert.metadata ? `<pre style="background:#fff;padding:12px;border-radius:4px;font-size:12px;overflow:auto;">${JSON.stringify(alert.metadata, null, 2)}</pre>` : ''}
            <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
              Sent from Azure Cost Monitoring Platform &bull; ${new Date().toLocaleString()}
            </p>
          </div>
        </div>`,
    });

    return { sent: true };
  } catch (err) {
    console.error('[NotificationService] Email error:', err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * Sends a Slack webhook notification.
 */
async function sendSlackAlert(alert) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('[NotificationService] Slack not configured, skipping:', alert.title);
    return { sent: false, reason: 'Slack webhook not configured' };
  }

  const emojiMap = { low: ':information_source:', medium: ':warning:', high: ':red_circle:', critical: ':rotating_light:' };
  const emoji = emojiMap[alert.severity] || ':bell:';

  try {
    await axios.post(webhookUrl, {
      text: `${emoji} *${alert.title}*`,
      attachments: [
        {
          color: alert.severity === 'critical' ? 'danger' : alert.severity === 'high' ? 'warning' : 'good',
          text: alert.message,
          footer: `Azure Cost Monitor | ${alert.type} alert`,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    });
    return { sent: true };
  } catch (err) {
    console.error('[NotificationService] Slack error:', err.message);
    return { sent: false, reason: err.message };
  }
}

/**
 * Checks all active budgets and creates alerts when thresholds are exceeded.
 */
async function processAlerts() {
  try {
    const budgets = await Budget.findAll({ where: { status: { [Op.ne]: 'exceeded' } } });

    for (const budget of budgets) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const costAgg = await CostRecord.findOne({
        attributes: [
          [
            require('sequelize').fn('SUM', require('sequelize').col('amount')),
            'total',
          ],
        ],
        where: {
          subscriptionId: budget.subscriptionId,
          date: { [Op.gte]: startOfMonth },
        },
        raw: true,
      });

      const currentSpend = parseFloat(costAgg?.total || 0);
      const pctUsed = (currentSpend / parseFloat(budget.amount)) * 100;

      await budget.update({ currentSpend });

      if (pctUsed >= 100) {
        await budget.update({ status: 'exceeded' });
        const alert = await Alert.create({
          userId: budget.userId,
          type: 'budget',
          severity: 'critical',
          title: `Budget Exceeded: ${budget.name}`,
          message: `Your budget "${budget.name}" has been exceeded. Current spend: $${currentSpend.toFixed(2)} / $${budget.amount} (${pctUsed.toFixed(1)}%).`,
          subscriptionId: budget.subscriptionId,
          metadata: { budgetId: budget.id, currentSpend, budgetAmount: budget.amount, percentage: pctUsed },
        });
        await sendEmailAlert(budget.userId, alert.toJSON());
        await sendSlackAlert(alert.toJSON());
      } else if (pctUsed >= budget.alertThreshold && budget.status === 'active') {
        await budget.update({ status: 'warning' });
        const alert = await Alert.create({
          userId: budget.userId,
          type: 'budget',
          severity: 'high',
          title: `Budget Warning: ${budget.name}`,
          message: `Your budget "${budget.name}" has reached ${pctUsed.toFixed(1)}% of the limit ($${currentSpend.toFixed(2)} / $${budget.amount}).`,
          subscriptionId: budget.subscriptionId,
          metadata: { budgetId: budget.id, currentSpend, budgetAmount: budget.amount, percentage: pctUsed },
        });
        await sendEmailAlert(budget.userId, alert.toJSON());
      }
    }

    console.log(`[NotificationService] Processed ${budgets.length} budgets`);
  } catch (err) {
    console.error('[NotificationService] processAlerts error:', err.message);
  }
}

module.exports = { sendEmailAlert, sendSlackAlert, processAlerts };
