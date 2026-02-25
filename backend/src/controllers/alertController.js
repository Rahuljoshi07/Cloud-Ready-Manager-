let alerts = [
  {
    id: 'alert-001',
    user_id: 'user-001',
    title: 'Budget Threshold Exceeded',
    message: 'Production Environment budget has reached 85.9% of its monthly limit ($55,000). Current spend: $47,230.',
    severity: 'high',
    type: 'budget_alert',
    status: 'active',
    resource_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'alert-002',
    user_id: 'user-001',
    title: 'Cost Anomaly Detected',
    message: 'Unusual cost spike detected for Virtual Machines in East US region. Daily cost is 145% above the 7-day average.',
    severity: 'critical',
    type: 'anomaly',
    status: 'active',
    resource_id: '/subscriptions/sub-a1b2c3d4/resourceGroups/rg-production/providers/Microsoft.Compute/virtualMachines/vm-web-prod-01',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'alert-003',
    user_id: 'user-001',
    title: 'Analytics Budget Near Limit',
    message: 'Analytics Platform budget is at 93.3% utilization. Consider reviewing analytics workloads to avoid overage.',
    severity: 'critical',
    type: 'budget_alert',
    status: 'active',
    resource_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'alert-004',
    user_id: 'user-001',
    title: 'Idle Resource Detected',
    message: 'VM vm-dev-02 in rg-development has shown no CPU activity for 14 days and is still incurring charges.',
    severity: 'medium',
    type: 'idle_resource',
    status: 'active',
    resource_id: '/subscriptions/sub-a1b2c3d4/resourceGroups/rg-development/providers/Microsoft.Compute/virtualMachines/vm-dev-02',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'alert-005',
    user_id: 'user-001',
    title: 'Monthly Cost Forecast Alert',
    message: 'Based on current trends, total monthly spend is projected to reach $78,450 — 12% above last month.',
    severity: 'medium',
    type: 'forecast',
    status: 'acknowledged',
    resource_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'alert-006',
    user_id: 'user-001',
    title: 'Underutilized VM Identified',
    message: 'VM vm-dev-01 CPU utilization has been below 5% for 30 days. Consider right-sizing to reduce costs.',
    severity: 'low',
    type: 'optimization',
    status: 'active',
    resource_id: '/subscriptions/sub-a1b2c3d4/resourceGroups/rg-development/providers/Microsoft.Compute/virtualMachines/vm-dev-01',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'alert-007',
    user_id: 'user-001',
    title: 'Storage Cost Increase',
    message: 'Azure Blob Storage costs have increased by 22% compared to the previous month due to increased data volume.',
    severity: 'low',
    type: 'cost_increase',
    status: 'resolved',
    resource_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

const getAlerts = (req, res) => {
  try {
    const { status, severity } = req.query;
    let filtered = [...alerts];
    if (status) filtered = filtered.filter(a => a.status === status);
    if (severity) filtered = filtered.filter(a => a.severity === severity);
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const summary = {
      total: alerts.length,
      active: alerts.filter(a => a.status === 'active').length,
      critical: alerts.filter(a => a.severity === 'critical' && a.status === 'active').length,
      high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length
    };
    return res.json({ success: true, data: filtered, summary });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createAlert = (req, res) => {
  try {
    const { title, message, severity, type, resource_id } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }
    const newAlert = {
      id: `alert-${Date.now()}`,
      user_id: req.user.userId,
      title,
      message,
      severity: severity || 'medium',
      type: type || 'custom',
      status: 'active',
      resource_id: resource_id || null,
      created_at: new Date().toISOString()
    };
    alerts.unshift(newAlert);
    return res.status(201).json({ success: true, message: 'Alert created', data: newAlert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAlert = (req, res) => {
  try {
    const { id } = req.params;
    const idx = alerts.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    const { status } = req.body;
    if (status) alerts[idx].status = status;
    return res.json({ success: true, message: 'Alert updated', data: alerts[idx] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAlert = (req, res) => {
  try {
    const { id } = req.params;
    const idx = alerts.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    alerts.splice(idx, 1);
    return res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert };
