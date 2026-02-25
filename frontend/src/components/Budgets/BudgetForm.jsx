import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function BudgetForm({ onSubmit, onCancel, subscriptions = [], loading = false }) {
  const [form, setForm] = useState({
    name: '',
    subscriptionId: '',
    amount: '',
    period: 'Monthly',
    alertThreshold: '80',
  });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.alertThreshold || isNaN(form.alertThreshold) || Number(form.alertThreshold) < 1 || Number(form.alertThreshold) > 100)
      e.alertThreshold = 'Threshold must be 1–100';
    return e;
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({
      ...form,
      amount: Number(form.amount),
      alertThreshold: Number(form.alertThreshold),
    });
  }

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    width: '100%',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  const errStyle = { color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' };

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem' }}>Create Budget</h2>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Budget Name */}
            <div>
              <label>Budget Name</label>
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Production Monthly"
                style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : 'var(--border-color)' }}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>

            {/* Subscription */}
            <div>
              <label>Subscription</label>
              <select
                value={form.subscriptionId}
                onChange={(e) => handleChange('subscriptionId', e.target.value)}
                style={inputStyle}
              >
                <option value="">All Subscriptions</option>
                {subscriptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.displayName || s.name}</option>
                ))}
              </select>
            </div>

            {/* Amount + Period */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label>Budget Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  placeholder="10000"
                  style={{ ...inputStyle, borderColor: errors.amount ? '#ef4444' : 'var(--border-color)' }}
                />
                {errors.amount && <p style={errStyle}>{errors.amount}</p>}
              </div>
              <div>
                <label>Period</label>
                <select
                  value={form.period}
                  onChange={(e) => handleChange('period', e.target.value)}
                  style={inputStyle}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>

            {/* Alert Threshold */}
            <div>
              <label>Alert Threshold (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.alertThreshold}
                onChange={(e) => handleChange('alertThreshold', e.target.value)}
                placeholder="80"
                style={{ ...inputStyle, borderColor: errors.alertThreshold ? '#ef4444' : 'var(--border-color)' }}
              />
              {errors.alertThreshold && <p style={errStyle}>{errors.alertThreshold}</p>}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>
                You'll receive an alert when spending reaches this % of the budget.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px', background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.875rem', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px', background: '#3b82f6', color: 'white',
                border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem', fontWeight: '500', fontFamily: 'inherit',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {loading && <span className="spinner spinner-sm" style={{ width: '14px', height: '14px' }} />}
              Create Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
