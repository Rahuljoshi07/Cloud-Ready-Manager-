const nodemailer = require('nodemailer');
const axios = require('axios');

/**
 * Create nodemailer transporter
 */
function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Fallback: ethereal test account for development
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'testpassword',
    },
  });
}

/**
 * Send email notification
 * @param {Object} options - { to, subject, html, text }
 */
async function sendEmail(options) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Azure Cost Monitor" <noreply@azurecostmonitor.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Slack notification via webhook
 * @param {string} message - Message text
 * @param {Object} attachment - Optional rich attachment
 */
async function sendSlackNotification(message, attachment = null) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('Slack webhook not configured, skipping notification');
    return { success: false, error: 'Webhook not configured' };
  }

  try {
    const payload = { text: message };
    if (attachment) {
      payload.attachments = [attachment];
    }
    await axios.post(webhookUrl, payload);
    return { success: true };
  } catch (error) {
    console.error('Slack notification failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send cost alert notification (email + Slack)
 */
async function sendCostAlert(alert, recipientEmail) {
  const severityColors = {
    critical: '#d32f2f',
    high: '#f57c00',
    medium: '#fbc02d',
    low: '#388e3c',
  };

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background: #0078d4; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0">⚠️ Azure Cost Alert</h2>
        <p style="margin:4px 0 0">Severity: <strong>${alert.severity?.toUpperCase()}</strong></p>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px; color: #333;">${alert.message}</p>
        ${alert.subscription_id ? `<p><strong>Subscription:</strong> ${alert.subscription_id}</p>` : ''}
        ${alert.resource_id ? `<p><strong>Resource:</strong> ${alert.resource_id}</p>` : ''}
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <a href="${process.env.APP_URL || 'http://localhost:3000'}/alerts" 
           style="background: #0078d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 16px;">
          View in Dashboard
        </a>
      </div>
    </div>
  `;

  const slackAttachment = {
    color: severityColors[alert.severity] || '#757575',
    title: `Azure Cost Alert - ${alert.severity?.toUpperCase()}`,
    text: alert.message,
    fields: [
      { title: 'Subscription', value: alert.subscription_id || 'N/A', short: true },
      { title: 'Type', value: alert.type || 'N/A', short: true },
    ],
    footer: 'Azure Cost Monitor',
    ts: Math.floor(Date.now() / 1000),
  };

  const results = await Promise.allSettled([
    recipientEmail ? sendEmail({
      to: recipientEmail,
      subject: `[${alert.severity?.toUpperCase()}] Azure Cost Alert: ${alert.type}`,
      html: emailHtml,
      text: alert.message,
    }) : Promise.resolve({ success: false, error: 'No recipient' }),
    sendSlackNotification(`🚨 *Azure Cost Alert* [${alert.severity?.toUpperCase()}]\n${alert.message}`, slackAttachment),
  ]);

  return {
    email: results[0].value,
    slack: results[1].value,
  };
}

/**
 * Send budget threshold notification
 */
async function sendBudgetAlert(budget, currentSpend, recipientEmail) {
  const percentage = ((currentSpend / budget.amount) * 100).toFixed(1);
  const message = `Budget "${budget.name}" has reached ${percentage}% of its $${budget.amount} ${budget.period} limit. Current spend: $${currentSpend.toFixed(2)}.`;

  return sendCostAlert(
    {
      type: 'budget_threshold',
      severity: parseFloat(percentage) >= 100 ? 'critical' : 'high',
      message,
      subscription_id: budget.subscription_id,
    },
    recipientEmail
  );
}

module.exports = {
  sendEmail,
  sendSlackNotification,
  sendCostAlert,
  sendBudgetAlert,
};
