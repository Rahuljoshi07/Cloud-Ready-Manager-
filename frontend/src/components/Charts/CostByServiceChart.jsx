import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';

const COLORS = ['#0078d4', '#50b0f8', '#ffb900', '#107c10', '#d83b01', '#8764b8', '#00b7c3', '#038387', '#e3008c', '#767676'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 6, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label || payload[0]?.name}</p>
        <p style={{ color: COLORS[0], fontSize: 13 }}>
          ${parseFloat(payload[0]?.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const CostByServiceChart = ({ data = [], type = 'bar' }) => {
  const [chartType, setChartType] = useState(type);

  const chartData = data.slice(0, 8).map(d => ({
    name: d.service_name,
    value: parseFloat(d.total_cost),
  }));

  return (
    <div className="card" style={{ height: 340 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Cost by Service</div>
          <div className="card-subtitle">Top 8 services this period</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['bar', 'pie'].map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`btn btn-sm ${chartType === t ? 'btn-primary' : 'btn-secondary'}`}
            >
              {t === 'bar' ? '▦' : '◉'}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => [`$${parseFloat(v).toLocaleString()}`, 'Cost']} />
            <Legend
              formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{value}</span>}
            />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default CostByServiceChart;
