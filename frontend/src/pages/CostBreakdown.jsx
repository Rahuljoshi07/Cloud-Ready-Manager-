import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { MdSearch, MdFilterList } from 'react-icons/md';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MOCK_RESOURCES = [
  { id: 1, name: 'vm-01', type: 'Microsoft.Compute/virtualMachines', resource_group: 'prod-rg', subscription_id: 'sub-prod-001', region: 'East US', status: 'running', cpu_utilization: 45.2, memory_utilization: 62.1, monthly_cost: 280.50 },
  { id: 2, name: 'sql-01', type: 'Microsoft.Sql/servers', resource_group: 'data-rg', subscription_id: 'sub-prod-001', region: 'East US', status: 'running', cpu_utilization: 22.5, memory_utilization: 48.3, monthly_cost: 420.00 },
  { id: 3, name: 'aks-01', type: 'Microsoft.ContainerService/managedClusters', resource_group: 'prod-rg', subscription_id: 'sub-prod-001', region: 'West US 2', status: 'running', cpu_utilization: 68.9, memory_utilization: 71.2, monthly_cost: 580.00 },
  { id: 4, name: 'storage-01', type: 'Microsoft.Storage/storageAccounts', resource_group: 'data-rg', subscription_id: 'sub-prod-001', region: 'East US', status: 'running', cpu_utilization: 0, memory_utilization: 0, monthly_cost: 48.30 },
  { id: 5, name: 'vm-07', type: 'Microsoft.Compute/virtualMachines', resource_group: 'dev-rg', subscription_id: 'sub-dev-002', region: 'East US', status: 'running', cpu_utilization: 2.1, memory_utilization: 8.5, monthly_cost: 180.00 },
  { id: 6, name: 'app-02', type: 'Microsoft.Web/sites', resource_group: 'prod-rg', subscription_id: 'sub-prod-001', region: 'North Europe', status: 'running', cpu_utilization: 34.7, memory_utilization: 52.0, monthly_cost: 95.00 },
];

const getStatusClass = (status) => ({
  running: 'badge-running', stopped: 'badge-stopped', deallocated: 'badge-dismissed',
}[status] || 'badge-info');

const CostBreakdown = () => {
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [rgFilter, setRgFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: resourcesData, isLoading } = useQuery(
    ['resources', subFilter, rgFilter, statusFilter],
    () => {
      const params = new URLSearchParams();
      if (subFilter) params.set('subscription_id', subFilter);
      if (rgFilter) params.set('resource_group', rgFilter);
      if (statusFilter) params.set('status', statusFilter);
      return api.get(`/resources?${params}`).then(r => r.data.data).catch(() => null);
    }
  );

  const resources = resourcesData || MOCK_RESOURCES;

  const filtered = resources.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.type?.toLowerCase().includes(search.toLowerCase()) ||
    r.resource_group?.toLowerCase().includes(search.toLowerCase())
  );

  const subscriptions = [...new Set(resources.map(r => r.subscription_id).filter(Boolean))];
  const resourceGroups = [...new Set(resources.map(r => r.resource_group).filter(Boolean))];

  const totalCost = filtered.reduce((sum, r) => sum + parseFloat(r.monthly_cost || 0), 0);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Cost Breakdown</h1>
        <p>Detailed resource-level cost analysis across your Azure subscriptions</p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resources Shown</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{filtered.length}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Monthly Cost</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-blue)' }}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Running</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-green)' }}>{filtered.filter(r => r.status === 'running').length}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idle (&lt;5% CPU)</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-orange)' }}>
            {filtered.filter(r => r.status === 'running' && parseFloat(r.cpu_utilization) < 5).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div style={{ position: 'relative' }}>
          <MdSearch style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 28, minWidth: 220 }}
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="form-select" value={subFilter} onChange={e => setSubFilter(e.target.value)}>
          <option value="">All Subscriptions</option>
          {subscriptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-select" value={rgFilter} onChange={e => setRgFilter(e.target.value)}>
          <option value="">All Resource Groups</option>
          {resourceGroups.map(rg => <option key={rg} value={rg}>{rg}</option>)}
        </select>
        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="deallocated">Deallocated</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Resource Name</th>
                <th>Type</th>
                <th>Resource Group</th>
                <th>Region</th>
                <th>Status</th>
                <th>CPU %</th>
                <th>Memory %</th>
                <th>Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No resources found</td></tr>
              ) : (
                filtered.map(resource => (
                  <tr key={resource.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>{resource.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{resource.type?.split('/').slice(-1)[0] || resource.type}</td>
                    <td>{resource.resource_group}</td>
                    <td>{resource.region}</td>
                    <td><span className={`badge ${getStatusClass(resource.status)}`}>{resource.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-primary)', borderRadius: 2, minWidth: 40 }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${resource.cpu_utilization}%`,
                            background: resource.cpu_utilization > 80 ? 'var(--accent-red)' : resource.cpu_utilization < 10 ? 'var(--accent-orange)' : 'var(--accent-blue)',
                          }} />
                        </div>
                        <span>{parseFloat(resource.cpu_utilization || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg-primary)', borderRadius: 2, minWidth: 40 }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${resource.memory_utilization}%`,
                            background: resource.memory_utilization > 85 ? 'var(--accent-red)' : 'var(--accent-green)',
                          }} />
                        </div>
                        <span>{parseFloat(resource.memory_utilization || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${parseFloat(resource.monthly_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
