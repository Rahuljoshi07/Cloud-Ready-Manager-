import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#ec4899', '#14b8a6', '#a855f7'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px'
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: d.payload.fill, marginBottom: 4 }}>{d.name}</p>
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          ${d.value?.toLocaleString()}
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.payload.percentage}%</p>
      </div>
    );
  }
  return null;
};

const CostByServiceChart = ({ data, loading }) => {
  if (loading) return <div className="skeleton" style={{ height: 260, borderRadius: 8 }} />;
  if (!data || data.length === 0) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          dataKey="cost"
          nameKey="service"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{value}</span>}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CostByServiceChart;
