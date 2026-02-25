import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, color = '#3b82f6', trend, trendValue, loading }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'var(--accent-red)' : trend === 'down' ? 'var(--accent-green)' : 'var(--text-muted)';

  if (loading) {
    return (
      <div className="card" style={{ minHeight: 120 }}>
        <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 32, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '50%' }} />
      </div>
    );
  }

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: `linear-gradient(90deg, ${color}, transparent)`
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 6 }}>
            {value}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {trend && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: trendColor, fontWeight: 600 }}>
                <TrendIcon size={12} />
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</span>
            )}
          </div>
        </div>

        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
