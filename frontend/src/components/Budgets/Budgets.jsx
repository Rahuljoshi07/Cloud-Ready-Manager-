import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, X } from 'lucide-react';
import { budgetsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BudgetModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({ name: '', amount: '', period: 'monthly', threshold_percentage: 80 });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount) return toast.error('Name and amount required');
    setSaving(true);
    try {
      const res = await budgetsAPI.create(form);
      onCreate(res.data.data);
      toast.success('Budget created!');
      onClose();
    } catch {
      toast.error('Failed to create budget');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Budget</h3>
          <button className="btn btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Budget Name</label>
              <input
                className="form-input"
                placeholder="e.g., Production Environment"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g., 10000"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                required
                min={1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Period</label>
              <select
                className="form-select"
                value={form.period}
                onChange={e => setForm({ ...form, period: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Alert Threshold (%)</label>
              <input
                className="form-input"
                type="number"
                value={form.threshold_percentage}
                onChange={e => setForm({ ...form, threshold_percentage: parseInt(e.target.value) })}
                min={1}
                max={100}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    budgetsAPI.getAll()
      .then(res => setBudgets(res.data.data || []))
      .catch(() => toast.error('Failed to load budgets'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await budgetsAPI.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget deleted');
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'var(--accent-red)';
    if (pct >= 80) return 'var(--accent-yellow)';
    return 'var(--accent-green)';
  };

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpend = budgets.reduce((s, b) => s + b.current_spend, 0);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 className="page-title">Budgets</h2>
          <p className="page-subtitle">Monitor and manage your Azure spending budgets</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle size={15} /> New Budget
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Total Budget</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>${totalBudget.toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Current Spend</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--accent-blue)' }}>${totalSpend.toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>Overall Utilization</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: totalSpend / totalBudget > 0.9 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Budget Cards */}
      {loading ? (
        <div className="grid grid-2">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-2">
          {budgets.map(budget => {
            const pct = budget.spend_percentage || 0;
            const color = getProgressColor(pct);
            return (
              <div key={budget.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{budget.name}</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 4,
                        background: 'var(--bg-tertiary)', color: 'var(--text-muted)', textTransform: 'capitalize'
                      }}>
                        {budget.period}
                      </span>
                      <span className={`badge badge-${budget.status === 'exceeded' ? 'critical' : budget.status === 'warning' ? 'high' : 'low'}`}>
                        {budget.status}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(budget.id)}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      Spent: <strong style={{ color: 'var(--text-primary)' }}>${budget.current_spend?.toLocaleString()}</strong>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Limit: <strong style={{ color: 'var(--text-primary)' }}>${budget.amount?.toLocaleString()}</strong>
                  </span>
                  <span style={{ color: budget.remaining < 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    Remaining: <strong>${budget.remaining?.toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <BudgetModal
          onClose={() => setShowModal(false)}
          onCreate={b => setBudgets(prev => [b, ...prev])}
        />
      )}
    </div>
  );
};

export default Budgets;
