import React from 'react';

const KPICard = ({ label, value, change, changeLabel, icon, color = '#0078d4', bgColor }) => {
  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;

  let changeClass = 'neutral';
  // For cost metrics, increase is bad (up = orange), decrease is good (down = green)
  if (isPositive) changeClass = 'up';
  if (isNegative) changeClass = 'down';

  return (
    <div
      className="kpi-card"
      style={{ '--kpi-color': color, '--kpi-bg': bgColor || `${color}18` }}
    >
      {icon && <div className="kpi-icon">{icon}</div>}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div className={`kpi-change ${changeClass}`}>
          <span>{isPositive ? '▲' : isNegative ? '▼' : '─'}</span>
          <span>{typeof change === 'number' ? `${Math.abs(change).toFixed(1)}%` : change}</span>
          {changeLabel && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};

export default KPICard;
