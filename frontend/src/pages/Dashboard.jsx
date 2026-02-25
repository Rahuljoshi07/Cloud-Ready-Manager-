import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, Server, Lightbulb,
  AlertTriangle, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import KPICard from '../components/Dashboard/KPICard';
import CostTrendChart from '../components/Dashboard/CostTrendChart';
import CostByServiceChart from '../components/Dashboard/CostByServiceChart';
import CostByRegionChart from '../components/Dashboard/CostByRegionChart';
import RecentAlerts from '../components/Dashboard/RecentAlerts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, formatNumber } from '../utils/formatters';
import costService from '../services/costService';

/* ── Mock data fallbacks ─────────────────────── */
const MOCK_SUMMARY = {
  totalCostMTD: 48320.50,
  forecastedCost: 62800.00,
  activeResources: 142,
  potentialSavings: 8940.00,
  costTrend: 12.4,
  savingsTrend: -3.2,
  resourceTrend: 5.1,
};

const MOCK_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().slice(0, 10),
    cost: 1200 + Math.random() * 800 + (i > 20 ? i * 30 : 0),
  };
});

const MOCK_BY_SERVICE = [
  { name: 'Virtual Machines', value: 18400 },
  { name: 'Storage', value: 9200 },
  { name: 'App Services', value: 7100 },
  { name: 'SQL Database', value: 6300 },
  { name: 'Networking', value: 4200 },
  { name: 'Other', value: 3120 },
];

const MOCK_BY_REGION = [
  { region: 'East US', cost: 22000 },
  { region: 'West Europe', cost: 14500 },
  { region: 'Southeast Asia', cost: 8200 },
  { region: 'UK South', cost: 5800 },
  { region: 'Australia East', cost: 3200 },
];

const MOCK_ALERTS = [
  { id: 1, title: 'Budget threshold exceeded', message: 'Production subscription at 94% of monthly budget', severity: 'critical', status: 'active', createdAt: new Date().toISOString() },
  { id: 2, title: 'Unusual spend detected', message: 'East US region cost increased 40% in the last 24h', severity: 'high', status: 'active', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, title: 'Idle VMs detected', message: '8 virtual machines running with <5% CPU utilization', severity: 'medium', status: 'active', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_RECOMMENDATIONS = [
  { id: 1, resourceName: 'prod-vm-eastus-03', resourceType: 'Virtual Machine', action: 'Resize', description: 'VM has been running at <10% CPU for 30 days. Consider downsizing to save costs.', monthlySavings: 320 },
  { id: 2, resourceName: 'dev-storage-acc', resourceType: 'Storage', action: 'Optimize', description: 'Convert to cool tier storage – access patterns show infrequent reads.', monthlySavings: 85 },
];

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: costService.getDashboardSummary,
    refetchInterval: 60000,
    retry: 1,
  });

  const { data: trendData } = useQuery({
    queryKey: ['cost-trend', 30],
    queryFn: () => costService.getCostTrend(30),
    refetchInterval: 60000,
    retry: 1,
  });

  const { data: byService } = useQuery({
    queryKey: ['cost-by-service'],
    queryFn: () => costService.getCostByService(),
    retry: 1,
  });

  const { data: byRegion } = useQuery({
    queryKey: ['cost-by-region'],
    queryFn: () => costService.getCostByRegion(),
    retry: 1,
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: costService.getAlerts,
    refetchInterval: 60000,
    retry: 1,
  });

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: costService.getRecommendations,
    retry: 1,
  });

  const s = summary || MOCK_SUMMARY;
  const trend = Array.isArray(trendData) && trendData.length > 0 ? trendData : MOCK_TREND;
  const services = Array.isArray(byService) && byService.length > 0 ? byService : MOCK_BY_SERVICE;
  const regions = Array.isArray(byRegion) && byRegion.length > 0 ? byRegion : MOCK_BY_REGION;
  const alertList = Array.isArray(alerts) ? alerts : MOCK_ALERTS;
  const recList = Array.isArray(recommendations) ? recommendations : MOCK_RECOMMENDATIONS;

  const kpis = [
    {
      title: 'Total Cost MTD',
      value: formatCurrency(s.totalCostMTD),
      trend: s.costTrend,
      trendLabel: 'vs last month',
      icon: DollarSign,
      iconColor: '#3b82f6',
    },
    {
      title: 'Forecasted Cost',
      value: formatCurrency(s.forecastedCost),
      trend: null,
      subtitle: 'End of month estimate',
      icon: TrendingUp,
      iconColor: '#f59e0b',
    },
    {
      title: 'Active Resources',
      value: formatNumber(s.activeResources),
      trend: s.resourceTrend,
      trendLabel: 'vs last month',
      icon: Server,
      iconColor: '#22c55e',
    },
    {
      title: 'Potential Savings',
      value: formatCurrency(s.potentialSavings),
      trend: s.savingsTrend,
      trendLabel: 'optimization opportunities',
      icon: Lightbulb,
      iconColor: '#a855f7',
    },
  ];

  if (loadingSummary) {
    return <LoadingSpinner size="lg" text="Loading dashboard…" />;
  }

  const sectionTitle = { color: 'var(--text-primary)', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' };
  const sectionSub   = { color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '16px' };
  const cardStyle    = { background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '22px' };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', animation: 'fadeIn 0.35s ease' }}>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {kpis.map((kpi, i) => <KPICard key={i} {...kpi} />)}
      </div>

      {/* Cost Trend */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 style={sectionTitle}>Cost Trend</h2>
        <p style={sectionSub}>Daily spend over the last 30 days</p>
        <CostTrendChart data={trend} />
      </div>

      {/* Service + Region row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Cost by Service</h2>
          <p style={sectionSub}>Top services by spend this month</p>
          <CostByServiceChart data={services} />
        </div>
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Cost by Region</h2>
          <p style={sectionSub}>Spend distribution across regions</p>
          <CostByRegionChart data={regions} />
        </div>
      </div>

      {/* Alerts + Recommendations + Forecast */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: '20px' }}>
        {/* Recent Alerts */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ ...sectionTitle, marginBottom: '2px' }}>Recent Alerts</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {alertList.filter((a) => a.status === 'active' || a.status === 'open').length} active
              </p>
            </div>
            <AlertTriangle size={18} color="var(--accent-amber)" />
          </div>
          <RecentAlerts alerts={alertList} />
        </div>

        {/* Top Recommendations */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ ...sectionTitle, marginBottom: '2px' }}>Top Recommendations</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{recList.length} opportunities</p>
            </div>
            <Lightbulb size={18} color="#a855f7" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recList.slice(0, 3).map((rec, i) => (
              <div key={rec.id || i} style={{ padding: '12px 14px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {rec.resourceName || rec.title}
                  </span>
                  {rec.monthlySavings > 0 && (
                    <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.82rem', flexShrink: 0, marginLeft: '8px' }}>
                      -{formatCurrency(rec.monthlySavings)}/mo
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{rec.action} · {rec.resourceType}</p>
              </div>
            ))}
          </div>
          <Link to="/recommendations" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.82rem', fontWeight: '500', marginTop: '14px' }}>
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {/* Forecast card */}
        <div style={cardStyle}>
          <h2 style={{ ...sectionTitle, marginBottom: '16px' }}>Month Forecast</h2>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                background: 'conic-gradient(#3b82f6 0% 77%, var(--bg-tertiary) 77% 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
            >
              <div style={{ width: '58px', height: '58px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.9rem' }}>77%</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>Month progress</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.3rem' }}>
              {formatCurrency(s.forecastedCost)}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>projected total</p>
            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Current MTD</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.82rem' }}>{formatCurrency(s.totalCostMTD)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Potential savings</span>
                <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.82rem' }}>{formatCurrency(s.potentialSavings)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
