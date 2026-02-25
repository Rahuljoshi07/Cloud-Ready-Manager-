import React from 'react';
import { Server, Cloud, Database, Globe } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, getStatusBadgeVariant } from '../../utils/formatters';

const typeIcons = {
  'Virtual Machine': Server,
  'VM': Server,
  'Storage': Database,
  'Database': Database,
  'Web App': Globe,
  'App Service': Globe,
};

export default function ResourceCard({ resource }) {
  const Icon = typeIcons[resource.type] || Cloud;
  const isIdle = resource.cpuPercent !== undefined && resource.cpuPercent < 5;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${isIdle ? 'rgba(245,158,11,0.4)' : 'var(--border-color)'}`,
        borderRadius: '12px',
        padding: '20px',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color="var(--accent-blue)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '2px' }}>
              {resource.name}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{resource.type}</p>
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(resource.status)}>{resource.status}</Badge>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Region</span>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{resource.region || '—'}</p>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Resource Group</span>
          <p style={{ color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.resourceGroup || '—'}</p>
        </div>
        {resource.cpuPercent !== undefined && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>CPU</span>
            <p style={{ color: isIdle ? '#f59e0b' : 'var(--text-secondary)', marginTop: '2px', fontWeight: isIdle ? '600' : '400' }}>
              {resource.cpuPercent.toFixed(1)}% {isIdle ? '(Idle)' : ''}
            </p>
          </div>
        )}
        {resource.costPerDay !== undefined && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Cost/Day</span>
            <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginTop: '2px' }}>{formatCurrency(resource.costPerDay)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
