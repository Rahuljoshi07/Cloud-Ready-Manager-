import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, AlertCircle, Info, Bell, CheckCircle, Eye, Filter } from 'lucide-react';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import costService from '../services/costService';
import toast from 'react-hot-toast';

const MOCK_ALERTS = [
  { id: 1, title: 'Budget threshold exceeded',         message: 'Production subscription has reached 94% of its monthly budget of $50,000.', severity: 'critical', type: 'Budget',    status: 'active',   createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: 2, title: 'Unusual spending pattern detected', message: 'East US region cost increased 40% in the last 24 hours. Expected: $720, Actual: $1,008.', severity: 'high', type: 'Anomaly', status: 'active',   createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, title: 'Idle resources detected',           message: '8 virtual machines are running with less than 5% CPU utilization over the past 7 days.', severity: 'medium', type: 'Optimization', status: 'active', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, title: 'Reserved instance expiring',        message: '3 reserved instances for Standard_D4s_v3 expire in 14 days.', severity: 'medium', type: 'Reservation', status: 'active', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, title: 'Staging budget at 84%',             message: 'Staging environment has used $6,720 of $8,000 budget.', severity: 'warning', type: 'Budget', status: 'acknowledged', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 6, title: 'High storage costs',                message: 'Storage costs increased 25% in West Europe region.', severity: 'low', type: 'Cost', status: 'resolved', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 7, title: 'New Azure service limit approaching',message: 'Public IP address limit at 85% in East US region.', severity: 'info', type: 'Quota', status: 'active', createdAt: new Date(Date.now() - 345600000).toISOString() },
];

const severityConfig = {
  critical: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', variant: 'danger' },
  high:     { icon: AlertTriangle, color: '#f97316', bg: 'rgba(249,115,22,0.1)', variant: 'danger' },
  medium:   { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', variant: 'warning' },
  warning:  { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', variant: 'warning' },
  low:      { icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', variant: 'info' },
  info:     { icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', variant: 'info' },
};

const SEVERITY_FILTERS = ['All', 'critical', 'high', 'medium', 'low'];
const STATUS_FILTERS   = ['All', 'active', 'acknowledged', 'resolved'];

export default function Alerts() {
  const qc = useQueryClient();
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-page'],
    queryFn: costService.getAlerts,
    refetchInterval: 30000,
    retry: 1,
  });

  const acknowledgeMutation = useMutation({
    mutationFn: costService.acknowledgeAlert,
    onSuccess: () => { toast.success('Alert acknowledged'); qc.invalidateQueries({ queryKey: ['alerts-page'] }); },
    onError: () => toast.error('Failed to acknowledge alert'),
  });

  const resolveMutation = useMutation({
    mutationFn: costService.resolveAlert,
    onSuccess: () => { toast.success('Alert resolved'); qc.invalidateQueries({ queryKey: ['alerts-page'] }); },
    onError: () => toast.error('Failed to resolve alert'),
  });

  const allAlerts = Array.isArray(data) && data.length > 0 ? data : MOCK_ALERTS;

  const filtered = allAlerts.filter((a) => {
    const matchSev = severityFilter === 'All' || a.severity === severityFilter;
    const matchStat = statusFilter === 'All' || a.status === statusFilter;
    return matchSev && matchStat;
  });

  const counts = { active: 0, acknowledged: 0, resolved: 0 };
  allAlerts.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });

  const filterBtnStyle = (active) => ({
    padding: '7px 14px', borderRadius: '999px', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: '500', fontFamily: 'inherit',
    border: active ? 'none' : '1px solid var(--border-color)',
    background: active ? '#3b82f6' : 'transparent',
    color: active ? 'white' : 'var(--text-secondary)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', animation: 'fadeIn 0.35s ease' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Alerts',    value: allAlerts.length,      color: 'var(--text-primary)' },
          { label: 'Active',          value: counts.active,         color: '#ef4444' },
          { label: 'Acknowledged',    value: counts.acknowledged,   color: '#f59e0b' },
          { label: 'Resolved',        value: counts.resolved,       color: '#22c55e' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 22px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            <p style={{ color: s.color, fontWeight: '700', fontSize: '1.5rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <Filter size={14} color="var(--text-muted)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Severity:</span>
          {SEVERITY_FILTERS.map((f) => (
            <button key={f} onClick={() => setSeverityFilter(f)} style={filterBtnStyle(severityFilter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: '16px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Status:</span>
          {STATUS_FILTERS.map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)} style={filterBtnStyle(statusFilter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <LoadingSpinner size="md" text="Loading alerts…" />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <Bell size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p>No alerts match your filters</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((alert) => {
            const sev = (alert.severity || 'info').toLowerCase();
            const cfg = severityConfig[sev] || severityConfig.info;
            const Icon = cfg.icon;
            const isActive = alert.status === 'active';
            const isAcknowledged = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: `1px solid ${isActive ? cfg.color + '33' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  animation: 'fadeIn 0.25s ease',
                  opacity: alert.status === 'resolved' ? 0.7 : 1,
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={cfg.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>{alert.title}</span>
                    <Badge variant={cfg.variant}>{alert.severity}</Badge>
                    {alert.type && <Badge variant="default">{alert.type}</Badge>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '8px' }}>{alert.message}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(alert.createdAt, 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0, alignItems: 'flex-end' }}>
                  <Badge variant={alert.status === 'active' ? 'danger' : alert.status === 'acknowledged' ? 'warning' : 'success'}>
                    {alert.status}
                  </Badge>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    {isActive && (
                      <button
                        onClick={() => acknowledgeMutation.mutate(alert.id)}
                        disabled={acknowledgeMutation.isPending}
                        title="Acknowledge"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', fontFamily: 'inherit' }}
                      >
                        <Eye size={12} /> Acknowledge
                      </button>
                    )}
                    {(isActive || isAcknowledged) && (
                      <button
                        onClick={() => resolveMutation.mutate(alert.id)}
                        disabled={resolveMutation.isPending}
                        title="Resolve"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', fontFamily: 'inherit' }}
                      >
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
