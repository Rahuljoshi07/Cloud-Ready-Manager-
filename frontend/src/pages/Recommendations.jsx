import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingDown, Filter } from 'lucide-react';
import RecommendationCard from '../components/Recommendations/RecommendationCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import costService from '../services/costService';
import toast from 'react-hot-toast';

const MOCK_RECS = [
  { id: 1, resourceName: 'prod-vm-eastus-03', resourceType: 'Virtual Machine', action: 'Resize', subscriptionName: 'Production', description: 'This VM has been running at under 10% CPU utilization for the past 30 days. Downsizing from Standard_D4s_v3 to Standard_D2s_v3 could reduce costs by 50%.', recommendedAction: 'Resize to Standard_D2s_v3', monthlySavings: 320.00 },
  { id: 2, resourceName: 'asia-vm-idle',      resourceType: 'Virtual Machine', action: 'Shutdown', subscriptionName: 'Production', description: 'VM has only 1.2% average CPU utilization. It appears to be idle and could be shut down or deleted.', recommendedAction: 'Deallocate or delete the VM', monthlySavings: 865.00 },
  { id: 3, resourceName: 'dev-sql-dev',       resourceType: 'SQL Database',    action: 'Rightsize', subscriptionName: 'Development', description: 'Database has been consistently under-utilized during off-hours. Consider scaling down during non-business hours.', recommendedAction: 'Enable auto-pause for dev/test databases', monthlySavings: 220.00 },
  { id: 4, resourceName: 'archive-storage',   resourceType: 'Storage',         action: 'Optimize', subscriptionName: 'Production', description: 'This storage account stores rarely-accessed archive data. Converting to Archive tier can save significantly.', recommendedAction: 'Move to Archive tier storage', monthlySavings: 85.00 },
  { id: 5, resourceName: 'staging-app-service',resourceType: 'App Service',    action: 'Shutdown', subscriptionName: 'Staging',     description: 'Staging app service is running 24/7 but only needed during business hours. Schedule automatic start/stop.', recommendedAction: 'Configure auto-scale schedule', monthlySavings: 145.00 },
  { id: 6, resourceName: 'All Subscriptions', resourceType: 'Virtual Machine', action: 'Reserve',  subscriptionName: 'Production', description: 'You have 12 consistently running VMs. Purchasing 1-year reserved instances could reduce compute costs by up to 35%.', recommendedAction: 'Purchase Reserved Instances for stable workloads', monthlySavings: 1840.00 },
];

const FILTER_TABS = ['All', 'Resize', 'Shutdown', 'Reserve', 'Optimize', 'Rightsize'];

export default function Recommendations() {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('All');

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: costService.getRecommendations,
    retry: 1,
  });

  const applyMutation = useMutation({
    mutationFn: costService.applyRecommendation,
    onSuccess: () => {
      toast.success('Recommendation applied successfully!');
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onError: () => toast.error('Failed to apply recommendation'),
  });

  const dismissMutation = useMutation({
    mutationFn: costService.dismissRecommendation,
    onSuccess: () => {
      toast.success('Recommendation dismissed');
      qc.invalidateQueries({ queryKey: ['recommendations'] });
    },
    onError: () => toast.error('Failed to dismiss recommendation'),
  });

  const allRecs = Array.isArray(data) && data.length > 0 ? data : MOCK_RECS;
  const filtered = activeFilter === 'All'
    ? allRecs
    : allRecs.filter((r) => (r.action || '').toLowerCase() === activeFilter.toLowerCase());

  const totalSavings = allRecs.reduce((s, r) => s + (r.monthlySavings || 0), 0);
  const countByType = FILTER_TABS.slice(1).reduce((acc, t) => {
    acc[t] = allRecs.filter((r) => (r.action || '').toLowerCase() === t.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', animation: 'fadeIn 0.35s ease' }}>
      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 22px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Opportunities</p>
          <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.5rem' }}>{allRecs.length}</p>
        </div>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid #22c55e44', borderRadius: '12px', padding: '18px 22px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Savings</p>
          <p style={{ color: '#22c55e', fontWeight: '700', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={18} />{formatCurrency(totalSavings)}
          </p>
        </div>
        {Object.entries(countByType).filter(([, count]) => count > 0).slice(0, 3).map(([type, count]) => (
          <div key={type} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 22px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{type}</p>
            <p style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.5rem' }}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={15} color="var(--text-muted)" />
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '7px 14px',
              borderRadius: '999px',
              border: activeFilter === f ? 'none' : '1px solid var(--border-color)',
              background: activeFilter === f ? '#3b82f6' : 'transparent',
              color: activeFilter === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '500',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {f} {f !== 'All' && countByType[f] > 0 ? `(${countByType[f]})` : ''}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <LoadingSpinner size="md" text="Loading recommendations…" />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No recommendations for this filter</p>
          <p style={{ fontSize: '0.875rem' }}>Your cloud usage is optimized in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onApply={(id) => applyMutation.mutate(id)}
              onDismiss={(id) => dismissMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
