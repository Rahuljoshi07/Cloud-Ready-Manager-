import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  MdLightbulb, MdCheck, MdClose, MdSavings, MdCloud,
  MdStorage, MdMemory, MdSpeed, MdAutorenew,
} from 'react-icons/md';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MOCK_RECS = [
  { id: 1, type: 'rightsizing', resource_name: 'vm-03', description: 'VM vm-03 is consistently running at <15% CPU and <20% memory. Downsize from Standard_D4s_v3 to Standard_B2s to reduce costs by 68%.', potential_savings: 312.50, action: 'Resize VM to Standard_B2s', status: 'pending' },
  { id: 2, type: 'reserved_instances', resource_name: 'prod-rg VMs', description: 'Purchase 1-year Reserved Instances for 8 consistently running VMs. Pay-as-you-go to reserved pricing saves up to 40%.', potential_savings: 1840.00, action: 'Purchase Reserved Instances', status: 'pending' },
  { id: 3, type: 'storage_optimization', resource_name: 'storage-01', description: '2.4 TB of blob data hasn\'t been accessed in 90+ days. Enable lifecycle management to move to Cool/Archive tier.', potential_savings: 285.00, action: 'Enable storage lifecycle policy', status: 'pending' },
  { id: 4, type: 'auto_shutdown', resource_name: 'dev-rg', description: 'Dev/test VMs run 24/7 but only used 8 hours/day. Enable auto-shutdown schedules to reduce compute hours by 67%.', potential_savings: 520.00, action: 'Configure auto-shutdown policies', status: 'pending' },
  { id: 5, type: 'spot_instances', resource_name: 'aks-01', description: 'AKS node pool uses on-demand instances for batch workloads. Switch to Spot node pool for 60-80% savings.', potential_savings: 680.00, action: 'Add Spot node pool to AKS cluster', status: 'pending' },
  { id: 6, type: 'database_optimization', resource_name: 'sql-01', description: 'Azure SQL DTU utilization is 22%. Migrate to elastic pool to share capacity and reduce costs.', potential_savings: 420.00, action: 'Migrate to elastic pool', status: 'applied' },
];

const typeIcons = {
  rightsizing: <MdSpeed />, reserved_instances: <MdAutorenew />, storage_optimization: <MdStorage />,
  auto_shutdown: <MdCloud />, spot_instances: <MdMemory />, database_optimization: <MdCloud />,
  idle_resource: <MdCloud />, unused_ip: <MdCloud />,
};

const typeColors = {
  rightsizing: '#0078d4', reserved_instances: '#107c10', storage_optimization: '#8764b8',
  auto_shutdown: '#d83b01', spot_instances: '#ffb900', database_optimization: '#00b7c3',
};

const Recommendations = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data: recsData, isLoading } = useQuery(
    ['recommendations', statusFilter],
    () => api.get(`/recommendations${statusFilter ? `?status=${statusFilter}` : ''}`).then(r => r.data).catch(() => null)
  );

  const applyMutation = useMutation(
    (id) => api.put(`/recommendations/${id}/apply`),
    { onSuccess: () => queryClient.invalidateQueries('recommendations') }
  );

  const dismissMutation = useMutation(
    (id) => api.put(`/recommendations/${id}/dismiss`),
    { onSuccess: () => queryClient.invalidateQueries('recommendations') }
  );

  if (isLoading) return <LoadingSpinner />;

  const recs = recsData?.data || MOCK_RECS.filter(r => !statusFilter || r.status === statusFilter);
  const totalSavings = recsData?.total_potential_savings ||
    MOCK_RECS.filter(r => r.status === 'pending').reduce((s, r) => s + r.potential_savings, 0);

  return (
    <div>
      <div className="page-header">
        <h1>Optimization Recommendations</h1>
        <p>AI-powered suggestions to reduce your Azure cloud spending</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'rgba(16,124,16,0.12)', color: 'var(--accent-green)', width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            <MdSavings />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Potential Savings</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>
              ${parseFloat(totalSavings).toLocaleString('en-US', { minimumFractionDigits: 2 })}<span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Actions</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{MOCK_RECS.filter(r => r.status === 'pending').length}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Applied This Month</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-green)' }}>{MOCK_RECS.filter(r => r.status === 'applied').length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filters-bar">
        {['', 'pending', 'applied', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {recs.length === 0 ? (
        <div className="empty-state">
          <MdLightbulb style={{ fontSize: 48, opacity: 0.3 }} />
          <h3>No recommendations found</h3>
        </div>
      ) : (
        <div className="rec-grid">
          {recs.map(rec => (
            <div key={rec.id} className="rec-card">
              <div className="rec-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="rec-type-icon" style={{
                    background: `${typeColors[rec.type] || '#0078d4'}15`,
                    color: typeColors[rec.type] || '#0078d4',
                  }}>
                    {typeIcons[rec.type] || <MdLightbulb />}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: typeColors[rec.type] || 'var(--accent-blue)', textTransform: 'capitalize' }}>
                      {rec.type?.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.resource_name}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="rec-savings">
                    ${parseFloat(rec.potential_savings).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span>/mo</span>
                  </div>
                  <span className={`badge badge-${rec.status}`}>{rec.status}</span>
                </div>
              </div>

              <div className="rec-desc">{rec.description}</div>

              <div style={{ background: 'var(--bg-hover)', borderRadius: 4, padding: '6px 10px', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Action: </span>
                <span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{rec.action}</span>
              </div>

              {rec.status === 'pending' && (
                <div className="rec-footer">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => applyMutation.mutate(rec.id)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <MdCheck /> Apply
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => dismissMutation.mutate(rec.id)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <MdClose /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
