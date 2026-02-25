import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#f97316', '#ec4899'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>
          {payload[0].name}
        </p>
        <p style={{ color: payload[0].payload.fill || '#3b82f6', fontWeight: '600' }}>
          {formatCurrency(payload[0].value)}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {payload[0].payload.percentage?.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

function renderLegend({ payload }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {payload.map((entry, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
            {entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function CostByServiceChart({ data = [] }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);

  const enriched = data.map((d, i) => ({
    ...d,
    fill: d.color || COLORS[i % COLORS.length],
    percentage: total > 0 ? (d.value / total) * 100 : 0,
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enriched}
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {enriched.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
