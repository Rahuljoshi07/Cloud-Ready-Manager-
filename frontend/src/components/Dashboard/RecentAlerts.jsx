import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatters';

const severityConfig = {
  critical: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  high:     { icon: AlertTriangle, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  medium:   { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  warning:  { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  low:      { icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  info:     { icon: Info,          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  resolved: { icon: CheckCircle,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
};

function AlertRow({ alert }) {
  const sev = (alert.severity || 'info').toLowerCase();
  const cfg = severityConfig[sev] || severityConfig.info;
  const Icon = cfg.icon;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: cfg.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.875rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.title || alert.name || 'Alert'}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.message || alert.description || ''}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <span
          style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: '600',
            background: cfg.bg,
            color: cfg.color,
            textTransform: 'capitalize',
            marginBottom: '4px',
          }}
        >
          {sev}
        </span>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          {formatDate(alert.createdAt || alert.timestamp, 'MMM d')}
        </p>
      </div>
    </div>
  );
}

export default function RecentAlerts({ alerts = [] }) {
  const displayed = alerts.slice(0, 5);

  return (
    <div>
      {displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <CheckCircle size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
          <p style={{ fontSize: '0.875rem' }}>No recent alerts</p>
        </div>
      ) : (
        <div>
          {displayed.map((alert, i) => (
            <AlertRow key={alert.id || i} alert={alert} />
          ))}
        </div>
      )}
      <Link
        to="/alerts"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'var(--accent-blue)',
          textDecoration: 'none',
          fontSize: '0.82rem',
          fontWeight: '500',
          marginTop: '12px',
          paddingTop: '4px',
        }}
      >
        View all alerts <ArrowRight size={13} />
      </Link>
    </div>
  );
}
