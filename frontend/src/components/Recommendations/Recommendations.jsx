import React, { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, XCircle, Filter } from 'lucide-react';
import { recommendationsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  'Resize VM': '#3b82f6',
  'Stop VM': '#ef4444',
  'Storage Optimization': '#06b6d4',
  'License Optimization': '#10b981',
  'Scaling Optimization': '#8b5cf6',
  'Schedule Optimization': '#f59e0b',
  'Reserved Instances': '#ec4899',
  'Resize Resource': '#f97316'
};

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await recommendationsAPI.getAll({ status: filter !== 'all' ? filter : undefined });
      setRecommendations(res.data.data || []);
      setSummary(res.data.summary);
    } catch {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusUpdate = async (rec, status) => {
    try {
      const idPart = rec.resource_id.split('/').pop();
      await recommendationsAPI.updateStatus(idPart, status);
      setRecommendations(prev => prev.map(r => r.resource_id === rec.resource_id ? { ...r, status } : r));
      toast.success(`Recommendation marked as ${status}`);
    } catch {
      toast.error('Failed to update recommendation');
    }
  };

  const categories = summary?.categories || [];
  const filtered = categoryFilter === 'all' ? recommendations : recommendations.filter(r => r.category === categoryFilter);

  const totalSavings = recommendations
    .filter(r => r.status === 'active')
    .reduce((s, r) => s + parseFloat(r.estimated_savings || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Optimization Recommendations</h2>
        <p className="page-subtitle">AI-powered suggestions to reduce your Azure costs</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ borderTop: '3px solid var(--accent-green)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            Total Potential Savings
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-green)' }}>
            ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>per month if all implemented</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            Active Recommendations
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-blue)' }}>
            {summary?.active || 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>awaiting action</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 8 }}>
            Implemented
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-purple)' }}>
            {summary?.implemented || 0}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>completed this month</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="var(--text-muted)" />
        {['all', 'active', 'implemented', 'dismissed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === s ? 'var(--accent-blue)' : 'var(--bg-card)',
              color: filter === s ? 'white' : 'var(--text-secondary)',
              border: filter === s ? 'none' : '1px solid var(--border-color)',
              textTransform: 'capitalize'
            }}
          >
            {s}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: 'var(--border-color)' }} />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="form-select"
          style={{ padding: '6px 12px', fontSize: 12, minWidth: 160 }}
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Recommendation Cards */}
      {loading ? (
        <div className="grid grid-2">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 14 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Lightbulb size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 15, fontWeight: 500 }}>No recommendations found</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {filtered.map((rec, idx) => {
            const catColor = CATEGORY_COLORS[rec.category] || '#3b82f6';
            return (
              <div
                key={idx}
                className="card animate-fade-in"
                style={{
                  borderLeft: `4px solid ${catColor}`,
                  opacity: rec.status !== 'active' ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                        background: `${catColor}20`, color: catColor, textTransform: 'uppercase', letterSpacing: '0.5px'
                      }}>
                        {rec.category}
                      </span>
                      <span className={`badge badge-${rec.priority}`}>{rec.priority}</span>
                      {rec.status !== 'active' && (
                        <span className={`badge badge-${rec.status === 'implemented' ? 'active' : 'resolved'}`}>
                          {rec.status}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                      {rec.title}
                    </h4>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {rec.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Est. savings</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-green)' }}>
                      ${rec.estimated_savings}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/month</div>
                  </div>
                </div>

                {rec.status === 'active' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                    <button
                      className="btn btn-sm"
                      style={{ flex: 1, background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(16,185,129,0.2)' }}
                      onClick={() => handleStatusUpdate(rec, 'implemented')}
                    >
                      <CheckCircle size={13} /> Implement
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => handleStatusUpdate(rec, 'dismissed')}
                    >
                      <XCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
