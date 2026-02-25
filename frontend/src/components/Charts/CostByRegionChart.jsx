import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#0078d4', '#50b0f8', '#107c10', '#ffb900', '#d83b01', '#8764b8'];

const CostByRegionChart = ({ data = [] }) => {
  const chartData = data.slice(0, 6).map(d => ({
    name: d.region?.replace(' ', '\n') || 'Unknown',
    value: parseFloat(d.total_cost),
  }));

  return (
    <div className="card" style={{ height: 300 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Cost by Region</div>
          <div className="card-subtitle">Geographic distribution</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            formatter={(v) => [`$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Cost']}
            contentStyle={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 6, fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostByRegionChart;
