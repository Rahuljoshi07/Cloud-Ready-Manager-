import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { costsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#f97316', '#14b8a6'];

const CostBreakdown = () => {
  const [topResources, setTopResources] = useState([]);
  const [byResourceGroup, setByResourceGroup] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [topRes, rgRes] = await Promise.all([
          costsAPI.getTopResources(),
          costsAPI.getCostByResourceGroup()
        ]);
        setTopResources(topRes.data.data || []);
        setByResourceGroup(rgRes.data.data || []);
      } catch {
        toast.error('Failed to load cost breakdown');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = topResources.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.resource_group.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Cost Breakdown</h2>
        <p className="page-subtitle">Detailed cost analysis by resource group and top resources</p>
      </div>

      {/* Resource Group Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Cost by Resource Group</h3>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Monthly spend per resource group</p>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 260, borderRadius: 8 }} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byResourceGroup} barSize={36} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="resource_group"
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                formatter={(v) => [`$${v.toLocaleString()}`, 'Cost']}
                contentStyle={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 8, fontSize: 12
                }}
              />
              <Bar dataKey="cost" radius={[5, 5, 0, 0]}>
                {byResourceGroup.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Resources Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Top 10 Expensive Resources</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sorted by monthly cost</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
            borderRadius: 8, padding: '7px 12px', width: 220
          }}>
            <Search size={13} color="var(--text-muted)" />
            <input
              placeholder="Search resources..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 12, width: '100%'
              }}
            />
          </div>
        </div>

        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 48, borderRadius: 6, marginBottom: 6 }} />
          ))
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Resource Name</th>
                  <th>Type</th>
                  <th>Resource Group</th>
                  <th>Region</th>
                  <th>Daily Cost</th>
                  <th>Monthly Cost</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <span style={{ color: 'var(--accent-blue-light)', fontWeight: 500, fontSize: 13 }}>
                        {res.name}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        background: 'var(--bg-tertiary)', padding: '2px 8px',
                        borderRadius: 4, fontSize: 11, color: 'var(--text-secondary)'
                      }}>
                        {res.type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{res.resource_group}</td>
                    <td style={{ fontSize: 12 }}>{res.region}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${res.daily_cost?.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: idx < 3 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                        ${res.monthly_cost?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <ArrowUpRight size={14} color="var(--accent-red)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostBreakdown;
