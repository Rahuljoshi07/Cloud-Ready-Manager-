import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, RefreshCw } from 'lucide-react';
import CostTrendChart from '../components/Dashboard/CostTrendChart';
import CostByRegionChart from '../components/Dashboard/CostByRegionChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import costService from '../services/costService';

const MOCK_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return { date: d.toISOString().slice(0, 10), cost: 1200 + Math.random() * 800 };
});

const MOCK_BY_SERVICE = [
  { name: 'Virtual Machines', value: 18400, costPerDay: 596 },
  { name: 'Storage', value: 9200, costPerDay: 297 },
  { name: 'App Services', value: 7100, costPerDay: 229 },
  { name: 'SQL Database', value: 6300, costPerDay: 203 },
  { name: 'Networking', value: 4200, costPerDay: 135 },
  { name: 'Kubernetes', value: 3800, costPerDay: 123 },
  { name: 'Azure Monitor', value: 1500, costPerDay: 48 },
  { name: 'Other', value: 1820, costPerDay: 59 },
];

const MOCK_BY_REGION = [
  { region: 'East US', cost: 22000 },
  { region: 'West Europe', cost: 14500 },
  { region: 'Southeast Asia', cost: 8200 },
  { region: 'UK South', cost: 5800 },
  { region: 'Australia East', cost: 3200 },
];

const MOCK_SUBSCRIPTIONS = [
  { id: 'sub-001', displayName: 'Production' },
  { id: 'sub-002', displayName: 'Development' },
  { id: 'sub-003', displayName: 'Staging' },
];

export default function CostAnalysis() {
  const [subscriptionId, setSubscriptionId] = useState('');
  const [days, setDays] = useState(30);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: costService.getSubscriptions,
    retry: 1,
  });

  const { data: trendData, isLoading: loadingTrend, refetch: refetchTrend } = useQuery({
    queryKey: ['cost-trend-analysis', days],
    queryFn: () => costService.getCostTrend(days),
    retry: 1,
  });

  const { data: byService, isLoading: loadingService } = useQuery({
    queryKey: ['cost-by-service-analysis', subscriptionId],
    queryFn: () => costService.getCostByService(subscriptionId),
    retry: 1,
  });

  const { data: byRegion, isLoading: loadingRegion } = useQuery({
    queryKey: ['cost-by-region-analysis', subscriptionId],
    queryFn: () => costService.getCostByRegion(subscriptionId),
    retry: 1,
  });

  const subs  = Array.isArray(subscriptions) ? subscriptions : MOCK_SUBSCRIPTIONS;
  const trend = Array.isArray(trendData) && trendData.length > 0 ? trendData : MOCK_TREND;
  const services = Array.isArray(byService) && byService.length > 0 ? byService : MOCK_BY_SERVICE;
  const regions  = Array.isArray(byRegion)  && byRegion.length  > 0 ? byRegion  : MOCK_BY_REGION;

  const totalCost = services.reduce((s, r) => s + (r.value || 0), 0);

  const cardStyle = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '22px' };
  const selectStyle = {
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '9px 14px', color: 'var(--text-primary)',
    fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', animation: 'fadeIn 0.35s ease' }}>
      {/* Filters */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>Subscription</label>
            <select value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)} style={selectStyle}>
              <option value="">All Subscriptions</option>
              {subs.map((s) => <option key={s.id} value={s.id}>{s.displayName || s.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: '600', marginBottom: '6px' }}>Time Range</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} style={selectStyle}>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={60}>Last 60 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
          <button
            onClick={() => refetchTrend()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', fontFamily: 'inherit' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Calendar size={15} />
            Total: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalCost)}</strong>
          </div>
        </div>
      </div>

      {/* Cost Trend */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Cost Trend</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>Daily spend over selected period</p>
        {loadingTrend ? <LoadingSpinner size="md" /> : <CostTrendChart data={trend} />}
      </div>

      {/* Service Table + Region Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Service breakdown table */}
        <div style={cardStyle}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Cost by Service</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>Spend breakdown by Azure service</p>
          {loadingService ? <LoadingSpinner size="md" /> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 0', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)' }}>Service</th>
                    <th style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)' }}>Total Cost</th>
                    <th style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)' }}>% of Total</th>
                    <th style={{ padding: '10px 0', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)' }}>Cost/Day</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => {
                    const pct = totalCost > 0 ? ((s.value / totalCost) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1, maxWidth: '160px' }}>
                              <p style={{ color: 'var(--text-primary)', fontWeight: '500', marginBottom: '4px' }}>{s.name}</p>
                              <div style={{ background: 'var(--bg-tertiary)', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: '999px', background: '#3b82f6', width: `${pct}%`, transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '600' }}>{formatCurrency(s.value)}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-muted)' }}>{pct}%</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-secondary)' }}>{s.costPerDay ? formatCurrency(s.costPerDay) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ padding: '12px 0', color: 'var(--text-primary)', fontWeight: '700' }}>Total</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '700' }}>{formatCurrency(totalCost)}</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--text-muted)' }}>100%</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Region chart */}
        <div style={cardStyle}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Cost by Region</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' }}>Spend distribution across Azure regions</p>
          {loadingRegion ? <LoadingSpinner size="md" /> : <CostByRegionChart data={regions} />}
        </div>
      </div>
    </div>
  );
}
