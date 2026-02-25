import React from 'react';
import { Server, Database, Globe, Zap, TrendingDown, X, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const typeIcons = {
  'Virtual Machine': Server,
  'VM': Server,
  'Storage': Database,
  'Database': Database,
  'Web App': Globe,
  'App Service': Globe,
  'Reserved Instance': Zap,
};

const actionColors = {
  resize:     '#f59e0b',
  shutdown:   '#ef4444',
  delete:     '#ef4444',
  rightsize:  '#f59e0b',
  reserve:    '#22c55e',
  optimize:   '#3b82f6',
};

export default function RecommendationCard({ recommendation, onApply, onDismiss }) {
  if (!recommendation) return null;
  const Icon = typeIcons[recommendation.resourceType] || Server;
  const action = (recommendation.action || 'optimize').toLowerCase();
  const accentColor = actionColors[action] || '#3b82f6';

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        animation: 'fadeIn 0.3s ease forwards',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: `${accentColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={accentColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>
              {recommendation.resourceName || recommendation.title}
            </span>
            <span
              style={{
                padding: '2px 8px',
                borderRadius: '999px',
                background: `${accentColor}18`,
                color: accentColor,
                fontSize: '0.7rem',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {action}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            {recommendation.resourceType} · {recommendation.subscriptionName || 'N/A'}
          </p>
        </div>
        {recommendation.monthlySavings > 0 && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e', fontWeight: '700', fontSize: '1rem' }}>
              <TrendingDown size={16} />
              {formatCurrency(recommendation.monthlySavings)}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>per month</p>
          </div>
        )}
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '14px' }}>
        {recommendation.description || recommendation.message}
      </p>

      {recommendation.recommendedAction && (
        <div
          style={{
            background: 'var(--bg-tertiary)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended: </span>
          {recommendation.recommendedAction}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        {onApply && (
          <button
            onClick={() => onApply(recommendation.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', background: '#22c55e', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: '500', fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#16a34a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#22c55e'; }}
          >
            <CheckCircle size={14} /> Apply
          </button>
        )}
        {onDismiss && (
          <button
            onClick={() => onDismiss(recommendation.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: '500', fontFamily: 'inherit',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={14} /> Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
