import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)'
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color }}>
            ${p.value?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            {p.name === 'forecast' && <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>(forecast)</span>}
          </p>
        ))}
        {payload[0]?.payload?.is_anomaly && (
          <p style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 4 }}>⚠ Anomaly detected</p>
        )}
      </div>
    );
  }
  return null;
};

const CostTrendChart = ({ data, forecastData, loading }) => {
  const combined = React.useMemo(() => {
    if (!data) return [];
    const hist = data.map(d => ({ date: d.date?.slice(5), total: d.total, is_anomaly: d.is_anomaly }));
    if (forecastData) {
      const fc = forecastData.slice(0, 14).map(d => ({ date: d.date?.slice(5), forecast: d.forecast }));
      return [...hist, ...fc];
    }
    return hist;
  }, [data, forecastData]);

  if (loading) {
    return <div className="skeleton" style={{ height: 280, borderRadius: 8 }} />;
  }

  const anomalyDates = combined.filter(d => d.is_anomaly).map(d => d.date);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={combined} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {anomalyDates.map(date => (
          <ReferenceLine key={date} x={date} stroke="var(--accent-red)" strokeDasharray="3 3" strokeOpacity={0.6} />
        ))}
        <Area
          type="monotone"
          dataKey="total"
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="url(#costGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#3b82f6' }}
        />
        <Area
          type="monotone"
          dataKey="forecast"
          stroke="#8b5cf6"
          strokeWidth={2}
          strokeDasharray="5 4"
          fill="url(#forecastGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#8b5cf6' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default CostTrendChart;
