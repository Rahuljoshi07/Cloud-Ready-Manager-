import React from 'react';
import { useQuery } from 'react-query';
import {
  MdAttachMoney, MdTrendingUp, MdCloud, MdNotifications, MdWarning,
} from 'react-icons/md';
import api from '../services/api';
import KPICard from '../components/Cards/KPICard';
import CostTrendChart from '../components/Charts/CostTrendChart';
import CostByServiceChart from '../components/Charts/CostByServiceChart';
import CostByRegionChart from '../components/Charts/CostByRegionChart';
import AlertBadge from '../components/common/AlertBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock fallback data
const MOCK_TREND = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return { usage_date: d.toISOString().split('T')[0], total_cost: (800 + Math.random() * 400 + i * 8).toFixed(2) };
});

const MOCK_SERVICES = [
  { service_name: 'Compute', total_cost: 4200 },
  { service_name: 'Database', total_cost: 1800 },
  { service_name: 'Kubernetes', total_cost: 2100 },
  { service_name: 'App Service', total_cost: 950 },
  { service_name: 'Storage', total_cost: 850 },
  { service_name: 'Networking', total_cost: 620 },
];

const MOCK_REGIONS = [
  { region: 'East US', total_cost: 4800 },
  { region: 'West US 2', total_cost: 3200 },
  { region: 'North Europe', total_cost: 2100 },
  { region: 'West Europe', total_cost: 1900 },
  { region: 'Southeast Asia', total_cost: 1200 },
];

const MOCK_ALERTS = [
  { id: 1, severity: 'critical', message: 'Compute costs spiked 245% above baseline in East US', type: 'cost_spike', created_at: new Date().toISOString(), is_resolved: false },
  { id: 2, severity: 'high', message: 'Production subscription exceeded 95% of monthly budget', type: 'budget_exceeded', created_at: new Date(Date.now() - 3600000).toISOString(), is_resolved: false },
  { id: 3, severity: 'medium', message: 'VM vm-07 running at <3% CPU for 14 days - idle resource', type: 'idle_resource', created_at: new Date(Date.now() - 7200000).toISOString(), is_resolved: false },
];

const Dashboard = () => {
  const { data: summary, isLoading: sumLoading } = useQuery('costSummary',
    () => api.get('/costs/summary').then(r => r.data).catch(() => null),
    { staleTime: 60000 }
  );

  const { data: trendData } = useQuery('costTrend',
    () => api.get('/costs/trend?days=30').then(r => r.data.data).catch(() => null)
  );

  const { data: serviceData } = useQuery('costByService',
    () => api.get('/costs/by-service').then(r => r.data.data).catch(() => null)
  );

  const { data: regionData } = useQuery('costByRegion',
    () => api.get('/costs/by-region').then(r => r.data.data).catch(() => null)
  );

  const { data: alertsData } = useQuery('recentAlerts',
    () => api.get('/alerts?limit=5&is_resolved=false').then(r => r.data.data).catch(() => null)
  );

  const { data: resourceStats } = useQuery('resourceStats',
    () => api.get('/resources/stats').then(r => r.data).catch(() => null)
  );

  const { data: alertSummary } = useQuery('alertSummaryDash',
    () => api.get('/alerts/summary').then(r => r.data).catch(() => null)
  );

  if (sumLoading) return <LoadingSpinner />;

  const trend = trendData || MOCK_TREND;
  const services = serviceData || MOCK_SERVICES;
  const regions = regionData || MOCK_REGIONS;
  const alerts = alertsData || MOCK_ALERTS;

  const totalMonthly = summary?.total_monthly || 11520;
  const dailyAvg = summary?.daily_average || 384;
  const momChange = summary?.mom_change || 3.2;
  const activeResources = resourceStats?.running || 42;
  const activeAlerts = alertSummary?.active || 3;

  return (
    <div>
      <div className="page-header">
        <h1>Cost Overview</h1>
        <p>Monitor and optimize your Azure cloud spending in real-time</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Monthly Cost"
          value={`$${totalMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change={momChange}
          changeLabel="vs last month"
          icon={<MdAttachMoney />}
          color="#0078d4"
        />
        <KPICard
          label="Daily Average"
          value={`$${parseFloat(dailyAvg).toFixed(2)}`}
          change={momChange}
          changeLabel="vs last month"
          icon={<MdTrendingUp />}
          color="#ffb900"
        />
        <KPICard
          label="Active Resources"
          value={activeResources.toLocaleString()}
          icon={<MdCloud />}
          color="#107c10"
        />
        <KPICard
          label="Active Alerts"
          value={activeAlerts.toLocaleString()}
          icon={<MdNotifications />}
          color={activeAlerts > 0 ? '#d83b01' : '#107c10'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <CostTrendChart data={trend} />
        <CostByServiceChart data={services} type="pie" />
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row" style={{ marginBottom: 16 }}>
        <CostByRegionChart data={regions} />
        <CostByServiceChart data={services} type="bar" />
      </div>

      {/* Recent Alerts */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Alerts</div>
            <div className="card-subtitle">Latest unresolved cost anomalies</div>
          </div>
          <a href="/alerts" className="btn btn-secondary btn-sm">View All</a>
        </div>

        {alerts.length === 0 ? (
          <div className="empty-state">
            <MdNotifications />
            <h3>No active alerts</h3>
          </div>
        ) : (
          <div className="alert-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item ${alert.severity}`}>
                <MdWarning className="alert-icon" style={{
                  color: alert.severity === 'critical' ? 'var(--accent-red)' :
                    alert.severity === 'high' ? 'var(--accent-orange)' :
                      alert.severity === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)'
                }} />
                <div className="alert-body">
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-meta">
                    <AlertBadge severity={alert.severity} />
                    <span>{alert.type?.replace(/_/g, ' ')}</span>
                    <span>{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
