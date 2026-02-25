import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server } from 'lucide-react';
import ResourceTable from '../components/Resources/ResourceTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import costService from '../services/costService';

const MOCK_RESOURCES = [
  { id: 'r1',  name: 'prod-vm-eastus-01',    type: 'Virtual Machine', resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 78.3, costPerDay: 32.10 },
  { id: 'r2',  name: 'prod-vm-eastus-02',    type: 'Virtual Machine', resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 65.1, costPerDay: 32.10 },
  { id: 'r3',  name: 'prod-vm-eastus-03',    type: 'Virtual Machine', resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 3.2,  costPerDay: 32.10 },
  { id: 'r4',  name: 'dev-vm-westeu-01',     type: 'Virtual Machine', resourceGroup: 'rg-dev',         region: 'West Europe',   status: 'Stopped',  cpuPercent: 0,    costPerDay: 0 },
  { id: 'r5',  name: 'prod-sql-primary',     type: 'SQL Database',    resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 42.0, costPerDay: 55.20 },
  { id: 'r6',  name: 'dev-sql-dev',          type: 'SQL Database',    resourceGroup: 'rg-dev',         region: 'West Europe',   status: 'Running',  cpuPercent: 2.1,  costPerDay: 18.40 },
  { id: 'r7',  name: 'prod-storage-01',      type: 'Storage',         resourceGroup: 'rg-production',  region: 'East US',       status: 'Active',   costPerDay: 12.30 },
  { id: 'r8',  name: 'archive-storage',      type: 'Storage',         resourceGroup: 'rg-archive',     region: 'UK South',      status: 'Active',   costPerDay: 4.80 },
  { id: 'r9',  name: 'prod-app-service',     type: 'App Service',     resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 25.5, costPerDay: 22.40 },
  { id: 'r10', name: 'staging-app-service',  type: 'App Service',     resourceGroup: 'rg-staging',     region: 'West Europe',   status: 'Running',  cpuPercent: 4.8,  costPerDay: 22.40 },
  { id: 'r11', name: 'prod-aks-cluster',     type: 'Kubernetes',      resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 58.7, costPerDay: 88.90 },
  { id: 'r12', name: 'prod-vnet',            type: 'Virtual Network', resourceGroup: 'rg-networking',  region: 'East US',       status: 'Active',   costPerDay: 0.50 },
  { id: 'r13', name: 'prod-loadbalancer',    type: 'Load Balancer',   resourceGroup: 'rg-production',  region: 'East US',       status: 'Active',   costPerDay: 5.20 },
  { id: 'r14', name: 'asia-vm-01',           type: 'Virtual Machine', resourceGroup: 'rg-asia',        region: 'Southeast Asia',status: 'Running',  cpuPercent: 88.2, costPerDay: 28.80 },
  { id: 'r15', name: 'asia-vm-idle',         type: 'Virtual Machine', resourceGroup: 'rg-asia',        region: 'Southeast Asia',status: 'Running',  cpuPercent: 1.2,  costPerDay: 28.80 },
  { id: 'r16', name: 'redis-cache-prod',     type: 'Redis Cache',     resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  costPerDay: 14.20 },
  { id: 'r17', name: 'func-app-prod',        type: 'Function App',    resourceGroup: 'rg-production',  region: 'East US',       status: 'Running',  cpuPercent: 12.3, costPerDay: 6.40 },
  { id: 'r18', name: 'keyvault-prod',        type: 'Key Vault',       resourceGroup: 'rg-security',    region: 'East US',       status: 'Active',   costPerDay: 0.80 },
];

export default function Resources() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resources'],
    queryFn: costService.getResources,
    retry: 1,
  });

  const resources = Array.isArray(data) && data.length > 0 ? data : MOCK_RESOURCES;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', animation: 'fadeIn 0.35s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>
            Azure Resources
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {resources.length} resources tracked · <span style={{ color: '#f59e0b' }}>{resources.filter((r) => r.cpuPercent !== undefined && r.cpuPercent < 5).length} idle</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => refetch()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: '500', fontFamily: 'inherit',
            }}
          >
            <Server size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Resources',   value: resources.length,                                                             color: '#3b82f6' },
          { label: 'Running',           value: resources.filter((r) => ['Running', 'Active'].includes(r.status)).length,    color: '#22c55e' },
          { label: 'Idle (<5% CPU)',    value: resources.filter((r) => r.cpuPercent !== undefined && r.cpuPercent < 5).length, color: '#f59e0b' },
          { label: 'Stopped',          value: resources.filter((r) => r.status === 'Stopped' || r.status === 'Deallocated').length, color: '#94a3b8' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px 20px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontWeight: '700', fontSize: '1.5rem' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '22px' }}>
        {isLoading ? (
          <LoadingSpinner size="md" text="Loading resources…" />
        ) : error && (!data || data.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '16px' }}>Using demo data (API unavailable)</p>
            <ResourceTable resources={MOCK_RESOURCES} />
          </div>
        ) : (
          <ResourceTable resources={resources} />
        )}
      </div>
    </div>
  );
}
