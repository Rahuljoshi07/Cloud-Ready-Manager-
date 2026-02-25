import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  MdAssessment, MdDownload, MdPictureAsPdf, MdBarChart, MdTrendingUp,
} from 'react-icons/md';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CostTrendChart from '../components/Charts/CostTrendChart';
import CostByServiceChart from '../components/Charts/CostByServiceChart';

const MOCK_SUMMARY = {
  total_monthly_cost: 11520.40,
  daily_average: 384.01,
  active_resources: 42,
  active_alerts: 4,
  total_potential_savings: 4104.10,
};

const Reports = () => {
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('monthly');

  const { data: summary } = useQuery('reportSummary',
    () => api.get('/reports/summary').then(r => r.data).catch(() => null)
  );

  const { data: trendData } = useQuery('reportTrend',
    () => api.get('/costs/trend?days=30').then(r => r.data.data).catch(() => null)
  );

  const { data: serviceData } = useQuery('reportServices',
    () => api.get('/costs/by-service').then(r => r.data.data).catch(() => null)
  );

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const response = await api.get('/reports/generate?format=pdf', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `azure-cost-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please ensure the backend is running.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadJSON = async () => {
    try {
      const response = await api.get('/reports/generate?format=json');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `azure-cost-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please ensure the backend is running.');
    }
  };

  const s = summary || MOCK_SUMMARY;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Reports</h1>
          <p>Generate and download cost reports for stakeholders and audit purposes</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleDownloadJSON}>
            <MdBarChart /> Export JSON
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={generating}>
            <MdPictureAsPdf /> {generating ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Report Preview</div>
            <div className="card-subtitle">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Cost Report
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)} style={{ width: 'auto' }}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        {/* KPI Summary Table */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total Monthly Cost', value: `$${parseFloat(s.total_monthly_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: '💰' },
            { label: 'Daily Average', value: `$${parseFloat(s.daily_average || 0).toFixed(2)}`, icon: '📅' },
            { label: 'Active Resources', value: s.active_resources || 0, icon: '☁️' },
            { label: 'Active Alerts', value: s.active_alerts || 0, icon: '🔔' },
            { label: 'Potential Savings', value: `$${parseFloat(s.total_potential_savings || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: '💡' },
            { label: 'Report Period', value: reportType.charAt(0).toUpperCase() + reportType.slice(1), icon: '📊' },
          ].map(item => (
            <div key={item.label} style={{
              background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
              padding: '12px 14px', border: '1px solid var(--border-color)',
            }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <CostTrendChart data={trendData || []} />
        <CostByServiceChart data={serviceData || []} type="pie" />
      </div>

      {/* Report Sections */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Report Contents</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { section: 'Executive Summary', description: 'KPIs: total cost, daily average, MoM change, projected spend', icon: '📊' },
            { section: 'Cost by Service', description: 'Breakdown of spend across Azure services with trend comparison', icon: '⚙️' },
            { section: 'Cost by Region', description: 'Geographic distribution of cloud spending', icon: '🌍' },
            { section: 'Top Resources', description: 'Top 20 most expensive resources with utilization metrics', icon: '🖥️' },
            { section: 'Optimization Recommendations', description: 'Actionable savings opportunities with ROI estimates', icon: '💡' },
            { section: 'Active Alerts', description: 'Unresolved cost anomalies and budget warnings', icon: '🔔' },
          ].map(item => (
            <div key={item.section} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.section}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.description}</div>
              </div>
              <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Included</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
          disabled={generating}
          style={{ padding: '12px 32px', fontSize: 15 }}
        >
          <MdDownload style={{ fontSize: 20 }} />
          {generating ? 'Generating...' : 'Generate & Download Full PDF Report'}
        </button>
      </div>
    </div>
  );
};

export default Reports;
