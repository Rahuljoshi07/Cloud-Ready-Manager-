import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ title, value, trend, trendLabel, icon: Icon, iconColor = '#3b82f6', subtitle }) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === null || trend === undefined;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'default',
        animation: 'fadeIn 0.35s ease forwards',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {title}
          </p>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: '700', lineHeight: 1.1 }}>
            {value}
          </p>
        </div>
        {Icon && (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${iconColor}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} color={iconColor} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {!isNeutral && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: isPositive ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
              color: isPositive ? '#ef4444' : '#22c55e',
            }}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
        {trendLabel && (
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{trendLabel}</span>
        )}
      </div>

      {subtitle && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '6px' }}>{subtitle}</p>
      )}
    </div>
  );
}
