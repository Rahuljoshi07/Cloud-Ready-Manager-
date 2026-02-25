/**
 * Notification service - placeholder for email/webhook notifications
 */

const notificationLog = [];

function sendAlert(userId, alert) {
  const notification = {
    id: Date.now().toString(),
    userId,
    alert,
    sentAt: new Date().toISOString(),
    channel: 'in-app'
  };
  notificationLog.push(notification);
  console.log(`[Notification] Alert sent to user ${userId}: ${alert.title}`);
  return notification;
}

function sendBudgetAlert(userId, budget) {
  const pct = budget.current_spend > 0
    ? ((budget.current_spend / budget.amount) * 100).toFixed(1)
    : 0;
  return sendAlert(userId, {
    title: `Budget Alert: ${budget.name}`,
    message: `Your budget "${budget.name}" has reached ${pct}% of its limit ($${budget.amount}).`,
    severity: pct >= 100 ? 'critical' : pct >= 90 ? 'high' : 'medium',
    type: 'budget_alert'
  });
}

function getNotificationLog() {
  return notificationLog;
}

module.exports = { sendAlert, sendBudgetAlert, getNotificationLog };
