import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MdAdd, MdDelete, MdAccountBalanceWallet } from 'react-icons/md';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const MOCK_BUDGETS = [
  { id: 1, name: 'Production Monthly Budget', subscription_id: 'sub-prod-001', amount: 15000, period: 'monthly', current_spend: 12500, threshold_percentage: 80 },
  { id: 2, name: 'Development Budget', subscription_id: 'sub-dev-002', amount: 3000, period: 'monthly', current_spend: 1800, threshold_percentage: 90 },
  { id: 3, name: 'Staging Budget', subscription_id: 'sub-staging-003', amount: 5000, period: 'monthly', current_spend: 3200, threshold_percentage: 85 },
];

const getProgressClass = (pct) => {
  if (pct >= 100) return 'exceeded';
  if (pct >= 90) return 'danger';
  if (pct >= 75) return 'warning';
  return 'safe';
};

const Budgets = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', subscription_id: '', amount: '', period: 'monthly', threshold_percentage: 80 });

  const { data: budgetsData, isLoading } = useQuery('budgets',
    () => api.get('/budgets').then(r => r.data.data).catch(() => null)
  );

  const createMutation = useMutation(
    (data) => api.post('/budgets', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets');
        setShowModal(false);
        setForm({ name: '', subscription_id: '', amount: '', period: 'monthly', threshold_percentage: 80 });
      },
    }
  );

  const deleteMutation = useMutation(
    (id) => api.delete(`/budgets/${id}`),
    { onSuccess: () => queryClient.invalidateQueries('budgets') }
  );

  if (isLoading) return <LoadingSpinner />;

  const budgets = budgetsData || MOCK_BUDGETS;
  const totalBudgeted = budgets.reduce((s, b) => s + parseFloat(b.amount), 0);
  const totalSpent = budgets.reduce((s, b) => s + parseFloat(b.current_spend || 0), 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Budgets</h1>
          <p>Set spending limits and get alerted when thresholds are breached</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> New Budget
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Budgeted</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-blue)' }}>${totalBudgeted.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Usage</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: (totalSpent / totalBudgeted) > 0.9 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: '14px 20px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-green)' }}>${(totalBudgeted - totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="budget-list">
        {budgets.map(budget => {
          const pct = parseFloat(budget.amount) > 0 ? (parseFloat(budget.current_spend || 0) / parseFloat(budget.amount)) * 100 : 0;
          const cls = getProgressClass(pct);

          return (
            <div key={budget.id} className="budget-card">
              <div className="budget-header">
                <div>
                  <div className="budget-name">{budget.name}</div>
                  <div className="budget-sub">{budget.subscription_id} • {budget.period} • Alert at {budget.threshold_percentage}%</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {pct >= 100 && <span className="badge badge-critical">Exceeded</span>}
                  {pct >= budget.threshold_percentage && pct < 100 && <span className="badge badge-high">Warning</span>}
                  <button className="btn btn-secondary btn-sm" onClick={() => deleteMutation.mutate(budget.id)}>
                    <MdDelete />
                  </button>
                </div>
              </div>

              <div className="budget-amounts">
                <span>Spent: <strong>${parseFloat(budget.current_spend || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{pct.toFixed(1)}%</span>
                <span>Budget: <strong>${parseFloat(budget.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></span>
              </div>

              <div className="progress-bar">
                <div className={`progress-fill ${cls}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <span>Threshold: {budget.threshold_percentage}% (${(parseFloat(budget.amount) * budget.threshold_percentage / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
                <span>Remaining: ${Math.max(0, parseFloat(budget.amount) - parseFloat(budget.current_spend || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title"><MdAccountBalanceWallet /> New Budget</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="form-group">
              <label className="form-label">Budget Name *</label>
              <input className="form-input" placeholder="e.g. Production Monthly Budget" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Subscription ID</label>
              <input className="form-input" placeholder="e.g. sub-prod-001" value={form.subscription_id} onChange={e => setForm({ ...form, subscription_id: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Budget Amount ($) *</label>
                <input type="number" className="form-input" placeholder="10000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Period</label>
                <select className="form-select" value={form.period} onChange={e => setForm({ ...form, period: e.target.value })}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Threshold (%): {form.threshold_percentage}%</label>
              <input type="range" min={50} max={100} value={form.threshold_percentage} onChange={e => setForm({ ...form, threshold_percentage: parseInt(e.target.value) })} style={{ width: '100%' }} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => createMutation.mutate(form)}
                disabled={!form.name || !form.amount || createMutation.isLoading}
              >
                {createMutation.isLoading ? 'Creating...' : 'Create Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
