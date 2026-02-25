import React from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Line,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 6, padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.name}: ${parseFloat(p.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CostTrendChart = ({ data = [], showForecast = false }) => {
  const formattedData = data.map(d => ({
    date: new Date(d.usage_date || d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    cost: parseFloat(d.total_cost || d.predicted_cost || 0),
    forecast: d.predicted_cost ? parseFloat(d.predicted_cost) : undefined,
    upper: d.upper_bound,
    lower: d.lower_bound,
  }));

  return (
    <div className="card" style={{ height: 300 }}>
      <div className="card-header">
        <div>
          <div className="card-title">Daily Cost Trend</div>
          <div className="card-subtitle">Last 30 days spending</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0078d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0078d4" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cost"
            name="Actual Cost"
            stroke="#0078d4"
            strokeWidth={2}
            fill="url(#costGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#0078d4' }}
          />
          {showForecast && (
            <Line
              type="monotone"
              dataKey="forecast"
              name="Forecast"
              stroke="#ffb900"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostTrendChart;
