import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Filter } from 'lucide-react';
import { alertsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const severityColors = {
  critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', dot: '#ef4444' },
  high: { bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)', dot: '#f97316' },
  medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  low: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', dot: '#10b981' }
};

const typeLabels = {
  budget_alert: 'Budget',
  anomaly: 'Anomaly',
  idle_resource: 'Idle Resource',
  forecast: 'Forecast',
  optimization: 'Optimization',
  cost_increase: 'Cost Increase',
  custom: 'Custom'
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      const res = await alertsAPI.getAll(params);
      setAlerts(res.data.data || []);
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [severityFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async (id, status) => {
    try {
      await alertsAPI.update(id, { status });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(`Alert ${status}`);
    } catch {
      toast.error('Failed to update alert');
    }
  };

  const handleDelete = async (id) => {
    try {
      await alertsAPI.delete(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch {
      toast.error('Failed to delete alert');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Alerts</h2>
        <p className="page-subtitle">Monitor cost anomalies, budget breaches, and optimization opportunities</p>
      </div>

      {/* Summary */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Alerts', value: summary?.total || 0, color: 'var(--accent-blue)' },
          { label: 'Active', value: summary?.active || 0, color: 'var(--accent-yellow)' },
          { label: 'Critical', value: summary?.critical || 0, color: 'var(--accent-red)' },
          { label: 'High Priority', value: summary?.high || 0, color: 'var(--accent-orange)' }
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="var(--text-muted)" />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Severity:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map(s => (
          <button
            key={s}
            onClick={() => setSeverityFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: severityFilter === s ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: severityFilter === s ? 'white' : 'var(--text-secondary)',
              border: severityFilter === s ? 'none' : '1px solid var(--border-color)',
              textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
        {['all', 'active', 'acknowledged', 'resolved'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, cursor: 'pointer',
              background: statusFilter === s ? 'var(--accent-purple)' : 'var(--bg-card)',
              color: statusFilter === s ? 'white' : 'var(--text-secondary)',
              border: statusFilter === s ? 'none' : '1px solid var(--border-color)',
              textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No alerts found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(alert => {
            const sc = severityColors[alert.severity] || severityColors.medium;
            return (
              <div
                key={alert.id}
                className="animate-fade-in"
                style={{
                  background: sc.bg,
                  border: `1px solid ${sc.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  opacity: alert.status === 'resolved' ? 0.6 : 1
                }}
              >
                {/* Severity dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: sc.dot, marginTop: 4, flexShrink: 0,
                  boxShadow: alert.status === 'active' ? `0 0 8px ${sc.dot}60` : 'none'
                }} />

                {/* Content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.title}</h4>
                    <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4,
                      background: 'var(--bg-tertiary)', color: 'var(--text-muted)'
                    }}>
                      {typeLabels[alert.type] || alert.type}
                    </span>
                    <span className={`badge badge-${alert.status}`}>{alert.status}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{alert.message}</p>
                  {alert.resource_id && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }} className="truncate">
                      📦 {alert.resource_id.split('/').slice(-1)[0]}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{timeAgo(alert.created_at)}</p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {alert.status === 'active' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Acknowledge"
                      onClick={() => handleUpdate(alert.id, 'acknowledged')}
                    >
                      <CheckCircle size={14} color="var(--accent-blue)" />
                    </button>
                  )}
                  {alert.status !== 'resolved' && (
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Resolve"
                      onClick={() => handleUpdate(alert.id, 'resolved')}
                    >
                      <CheckCircle size={14} color="var(--accent-green)" />
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Delete"
                    onClick={() => handleDelete(alert.id)}
                  >
                    <Trash2 size={14} color="var(--text-muted)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Alerts;
