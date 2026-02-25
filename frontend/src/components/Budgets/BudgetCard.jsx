import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';

function getBudgetVariant(percentage) {
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'success';
}

function getBudgetBarColor(percentage) {
  if (percentage >= 100) return '#ef4444';
  if (percentage >= 80) return '#f59e0b';
  return '#22c55e';
}

export default function BudgetCard({ budget }) {
  if (!budget) return null;

  const spent = budget.currentSpend || 0;
  const total = budget.amount || 1;
  const percentage = Math.min((spent / total) * 100, 100);
  const threshold = budget.alertThreshold || 80;
  const variant = getBudgetVariant(percentage);
  const barColor = getBudgetBarColor(percentage);

  const today = new Date();
  const periodEnd = budget.endDate ? new Date(budget.endDate) : null;
  const daysLeft = periodEnd ? Math.max(0, Math.ceil((periodEnd - today) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '22px',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>
            {budget.name}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            {budget.subscriptionName || budget.subscriptionId || 'All subscriptions'} · {budget.period || 'Monthly'}
          </p>
        </div>
        <Badge variant={variant}>
          {percentage >= 100 ? 'Exceeded' : percentage >= 80 ? 'At Risk' : 'On Track'}
        </Badge>
      </div>

      {/* Amounts */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.25rem' }}>
          {formatCurrency(spent)}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          of {formatCurrency(total)}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', marginBottom: '10px' }}>
        <div style={{ background: 'var(--bg-tertiary)', borderRadius: '999px', height: '10px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '999px',
              background: barColor,
              width: `${percentage}%`,
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        {/* Threshold marker */}
        <div
          title={`Alert threshold: ${threshold}%`}
          style={{
            position: 'absolute',
            top: '-2px',
            left: `${threshold}%`,
            width: '2px',
            height: '14px',
            background: '#f59e0b',
            borderRadius: '1px',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: barColor, fontWeight: '600', fontSize: '0.82rem' }}>
          {percentage.toFixed(1)}% used
        </span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {daysLeft !== null && (
            <span>{daysLeft} days left</span>
          )}
          <span>Threshold: {threshold}%</span>
        </div>
      </div>
    </div>
  );
}
