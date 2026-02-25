const Alert = require('../models/Alert');
const { sendCostAlert } = require('../services/notificationService');

const getAlerts = async (req, res) => {
  try {
    const filters = {
      is_resolved: req.query.is_resolved !== undefined ? req.query.is_resolved === 'true' : undefined,
      severity: req.query.severity,
      subscription_id: req.query.subscription_id,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined,
    };
    const alerts = await Alert.findAll(filters);
    res.json({ data: alerts, count: alerts.length });
  } catch (error) {
    console.error('getAlerts error:', error);
    res.status(500).json({ error: 'Failed to retrieve alerts.' });
  }
};

const getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve alert.' });
  }
};

const createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);

    // Send notifications if configured
    if (req.body.notify && req.user?.email) {
      sendCostAlert(alert, req.user.email).catch(console.error);
    }

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create alert.' });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.resolve(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve alert.' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    await Alert.delete(req.params.id);
    res.json({ message: 'Alert deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete alert.' });
  }
};

const getAlertSummary = async (req, res) => {
  try {
    const allAlerts = await Alert.findAll();
    const summary = {
      total: allAlerts.length,
      active: allAlerts.filter(a => !a.is_resolved).length,
      resolved: allAlerts.filter(a => a.is_resolved).length,
      critical: allAlerts.filter(a => !a.is_resolved && a.severity === 'critical').length,
      high: allAlerts.filter(a => !a.is_resolved && a.severity === 'high').length,
      medium: allAlerts.filter(a => !a.is_resolved && a.severity === 'medium').length,
      low: allAlerts.filter(a => !a.is_resolved && a.severity === 'low').length,
    };
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get alert summary.' });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createAlert,
  resolveAlert,
  deleteAlert,
  getAlertSummary,
};
