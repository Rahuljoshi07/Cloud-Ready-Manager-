import React, { useState, useEffect } from 'react';
import { DollarSign, Activity, Server, AlertTriangle, RefreshCw } from 'lucide-react';
import KPICard from './KPICard';
import CostTrendChart from './CostTrendChart';
import CostByServiceChart from './CostByServiceChart';
import CostByRegionChart from './CostByRegionChart';
import { costsAPI, alertsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [costTrend, setCostTrend] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [costByService, setCostByService] = useState(null);
  const [costByRegion, setCostByRegion] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const [summaryRes, trendRes, serviceRes, regionRes, forecastRes, alertsRes] = await Promise.all([
        costsAPI.getSummary(),
        costsAPI.getMonthlyCost(),
        costsAPI.getCostByService(),
        costsAPI.getCostByRegion(),
        costsAPI.getForecast(14),
        alertsAPI.getAll({ status: 'active' })
      ]);
      setSummary(summaryRes.data.data);
      setCostTrend(trendRes.data.data);
      setCostByService(serviceRes.data.data);
      setCostByRegion(regionRes.data.data);
      setForecastData(forecastRes.data.data?.forecast);
      setAlerts(alertsRes.data.data?.slice(0, 5) || []);
      if (showToast) toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const severityColor = {
    critical: 'var(--accent-red)',
    high: 'var(--accent-orange)',
    medium: 'var(--accent-yellow)',
    low: 'var(--accent-green)'
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Cost Overview</h2>
          <p className="page-subtitle">Azure subscription · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => fetchData(true)}
          disabled={refreshing}
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <KPICard
          title="Total Monthly Cost"
          value={loading ? '—' : `$${summary?.total_monthly_cost?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`}
          subtitle="vs last month"
          icon={DollarSign}
          color="#3b82f6"
          trend="up"
          trendValue="+8.3%"
          loading={loading}
        />
        <KPICard
          title="Daily Average"
          value={loading ? '—' : `$${summary?.daily_average?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`}
          subtitle="last 30 days"
          icon={Activity}
          color="#8b5cf6"
          trend="down"
          trendValue="-2.1%"
          loading={loading}
        />
        <KPICard
          title="Active Resources"
          value={loading ? '—' : summary?.active_resources?.toString() || '0'}
          subtitle={`of ${summary?.total_resources || 0} total`}
          icon={Server}
          color="#10b981"
          loading={loading}
        />
        <KPICard
          title="Active Alerts"
          value={loading ? '—' : alerts.length.toString()}
          subtitle="require attention"
          icon={AlertTriangle}
          color="#ef4444"
          trend={alerts.length > 3 ? 'up' : 'down'}
          trendValue={`${alerts.length} open`}
          loading={loading}
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Cost Trend</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>30-day history + 14-day forecast</p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 2, background: '#3b82f6', borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Actual</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 24, height: 2, background: '#8b5cf6', borderRadius: 1, borderTop: '2px dashed #8b5cf6' }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Forecast</span>
              </div>
            </div>
          </div>
          <CostTrendChart data={costTrend?.daily_costs} forecastData={forecastData} loading={loading} />
        </div>

        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Cost by Service</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Monthly breakdown</p>
          <CostByServiceChart data={costByService} loading={loading} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Cost by Region</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>Monthly spend per region</p>
          <CostByRegionChart data={costByRegion} loading={loading} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Recent Alerts</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active alerts requiring attention</p>
            </div>
            <a href="/alerts" style={{ fontSize: 12, color: 'var(--accent-blue)' }}>View all →</a>
          </div>
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8, marginBottom: 8 }} />
            ))
          ) : alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              ✅ No active alerts
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: severityColor[alert.severity] || 'var(--text-muted)'
                }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }} className="truncate">
                    {alert.title}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">
                    {alert.message}
                  </p>
                </div>
                <span className={`badge badge-${alert.severity}`} style={{ flexShrink: 0 }}>
                  {alert.severity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
