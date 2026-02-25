import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import BudgetCard from '../components/Budgets/BudgetCard';
import BudgetForm from '../components/Budgets/BudgetForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import costService from '../services/costService';
import toast from 'react-hot-toast';

const MOCK_BUDGETS = [
  { id: 1, name: 'Production Monthly',   subscriptionName: 'Production',  amount: 50000, currentSpend: 47200, period: 'Monthly',  alertThreshold: 80, endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString() },
  { id: 2, name: 'Development Budget',   subscriptionName: 'Development', amount: 10000, currentSpend: 3200,  period: 'Monthly',  alertThreshold: 90, endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString() },
  { id: 3, name: 'Staging Environment',  subscriptionName: 'Staging',     amount: 8000,  currentSpend: 6700,  period: 'Monthly',  alertThreshold: 75, endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString() },
  { id: 4, name: 'Annual CapEx Budget',  subscriptionName: 'All',         amount: 500000,currentSpend: 186000,period: 'Annual',   alertThreshold: 80, endDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString() },
  { id: 5, name: 'Asia Pacific Q2',      subscriptionName: 'Asia',        amount: 25000, currentSpend: 12800, period: 'Quarterly',alertThreshold: 80, endDate: new Date(new Date().getFullYear(), 5, 30).toISOString() },
];

const MOCK_SUBS = [
  { id: 'sub-001', displayName: 'Production' },
  { id: 'sub-002', displayName: 'Development' },
  { id: 'sub-003', displayName: 'Staging' },
];

export default function Budgets() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: costService.getBudgets,
    retry: 1,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: costService.getSubscriptions,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: costService.createBudget,
    onSuccess: () => {
      toast.success('Budget created successfully!');
      qc.invalidateQueries({ queryKey: ['budgets'] });
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create budget'),
  });

  const budgetList = Array.isArray(budgets) && budgets.length > 0 ? budgets : MOCK_BUDGETS;
  const subs = Array.isArray(subscriptions) ? subscriptions : MOCK_SUBS;

  const totalBudget = budgetList.filter((b) => b.period === 'Monthly').reduce((s, b) => s + b.amount, 0);
  const totalSpend  = budgetList.filter((b) => b.period === 'Monthly').reduce((s, b) => s + b.currentSpend, 0);
  const atRisk = budgetList.filter((b) => b.currentSpend / b.amount >= 0.8).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', animation: 'fadeIn 0.35s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>Budget Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            {budgetList.length} budgets · <span style={{ color: '#f59e0b' }}>{atRisk} at risk</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500', fontFamily: 'inherit' }}
        >
          <Plus size={16} /> New Budget
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total Monthly Budgets', value: `$${(totalBudget / 1000).toFixed(0)}k`,  color: '#3b82f6' },
          { label: 'Total MTD Spend',       value: `$${(totalSpend  / 1000).toFixed(0)}k`,  color: 'var(--text-primary)' },
          { label: 'Budgets At Risk',       value: atRisk,                                   color: '#f59e0b' },
          { label: 'Exceeded',              value: budgetList.filter((b) => b.currentSpend >= b.amount).length, color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '18px 22px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
            <p style={{ color: stat.color, fontWeight: '700', fontSize: '1.5rem' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Budget cards */}
      {isLoading ? (
        <LoadingSpinner size="md" text="Loading budgets…" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {budgetList.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <BudgetForm
          subscriptions={subs}
          loading={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
