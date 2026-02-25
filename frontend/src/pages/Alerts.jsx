import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MdNotifications, MdCheck, MdDelete, MdWarning, MdInfo } from 'react-icons/md';
import api from '../services/api';
import AlertBadge from '../components/common/AlertBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MOCK_ALERTS = [
  { id: 1, type: 'cost_spike', severity: 'critical', message: 'Compute costs spiked 245% above baseline in East US - unexpected VM scaling event detected', subscription_id: 'sub-prod-001', resource_id: '/subscriptions/sub-prod-001/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/vm-01', is_resolved: false, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, type: 'budget_exceeded', severity: 'high', message: 'Production subscription has exceeded 95% of monthly budget ($12,500 of $13,000 used)', subscription_id: 'sub-prod-001', resource_id: null, is_resolved: false, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, type: 'idle_resource', severity: 'medium', message: 'VM vm-07 has been running with <3% CPU utilization for 14 consecutive days, estimated waste: $180/month', subscription_id: 'sub-dev-002', resource_id: '/subscriptions/sub-dev-002/resourceGroups/dev-rg/providers/Microsoft.Compute/virtualMachines/vm-07', is_resolved: false, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 4, type: 'cost_spike', severity: 'high', message: 'Storage account egress costs increased by 180% - possible data exfiltration or misconfigured CDN', subscription_id: 'sub-prod-001', resource_id: null, is_resolved: false, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 5, type: 'idle_resource', severity: 'low', message: 'Load balancer lb-03 has zero backend connections for 7 days. Consider removing to save $35/month.', subscription_id: 'sub-dev-002', resource_id: null, is_resolved: true, created_at: new Date(Date.now() - 259200000).toISOString() },
];

const severityIcons = {
  critical: <MdWarning style={{ color: 'var(--accent-red)' }} />,
  high: <MdWarning style={{ color: 'var(--accent-orange)' }} />,
  medium: <MdWarning style={{ color: 'var(--accent-yellow)' }} />,
  low: <MdInfo style={{ color: 'var(--accent-green)' }} />,
};

const Alerts = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('active');
  const [severityFilter, setSeverityFilter] = useState('');

  const { data: alertsData, isLoading } = useQuery(
    ['alerts', filter, severityFilter],
    () => {
      const params = new URLSearchParams();
      if (filter === 'active') params.set('is_resolved', 'false');
      if (filter === 'resolved') params.set('is_resolved', 'true');
      if (severityFilter) params.set('severity', severityFilter);
      return api.get(`/alerts?${params}`).then(r => r.data).catch(() => null);
    }
  );

  const { data: summary } = useQuery('alertSummaryPage',
    () => api.get('/alerts/summary').then(r => r.data).catch(() => null)
  );

  const resolveMutation = useMutation(
    (id) => api.put(`/alerts/${id}/resolve`),
    { onSuccess: () => { queryClient.invalidateQueries('alerts'); queryClient.invalidateQueries('alertSummaryPage'); } }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/alerts/${id}`),
    { onSuccess: () => queryClient.invalidateQueries('alerts') }
  );

  if (isLoading) return <LoadingSpinner />;

  let alerts = alertsData?.data || MOCK_ALERTS;
  if (filter === 'active') alerts = alerts.filter(a => !a.is_resolved);
  if (filter === 'resolved') alerts = alerts.filter(a => a.is_resolved);
  if (severityFilter) alerts = alerts.filter(a => a.severity === severityFilter);

  const mockSummary = { active: 4, critical: 1, high: 1, medium: 1, low: 1 };
  const s = summary || mockSummary;

  return (
    <div>
      <div className="page-header">
        <h1>Cost Alerts</h1>
        <p>Monitor cost anomalies, budget breaches, and idle resource warnings</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active', value: s.active, color: 'var(--accent-blue)' },
          { label: 'Critical', value: s.critical, color: 'var(--accent-red)' },
          { label: 'High', value: s.high, color: 'var(--accent-orange)' },
          { label: 'Medium', value: s.medium, color: 'var(--accent-yellow)' },
          { label: 'Low', value: s.low, color: 'var(--accent-green)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ flex: 1, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>{item.value || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        {['all', 'active', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <select className="form-select" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <MdNotifications style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No alerts found</h3>
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`} style={{ opacity: alert.is_resolved ? 0.65 : 1 }}>
              <div className="alert-icon">{severityIcons[alert.severity] || <MdInfo />}</div>
              <div className="alert-body">
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <AlertBadge severity={alert.severity} />
                  <span className="badge badge-info">{alert.type?.replace(/_/g, ' ')}</span>
                  {alert.subscription_id && <span>📋 {alert.subscription_id}</span>}
                  <span>🕐 {new Date(alert.created_at).toLocaleString()}</span>
                  {alert.is_resolved && <span style={{ color: 'var(--accent-green)' }}>✓ Resolved</span>}
                </div>
              </div>
              {!alert.is_resolved && (
                <div className="alert-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => resolveMutation.mutate(alert.id)}
                    title="Mark resolved"
                  >
                    <MdCheck />
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => deleteMutation.mutate(alert.id)}
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
