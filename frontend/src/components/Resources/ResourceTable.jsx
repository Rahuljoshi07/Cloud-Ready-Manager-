import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Badge from '../common/Badge';
import { formatCurrency, getStatusBadgeVariant } from '../../utils/formatters';

const PAGE_SIZE = 15;

export default function ResourceTable({ resources = [] }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);

  const types   = useMemo(() => [...new Set(resources.map((r) => r.type).filter(Boolean))], [resources]);
  const regions = useMemo(() => [...new Set(resources.map((r) => r.region).filter(Boolean))], [resources]);
  const statuses = useMemo(() => [...new Set(resources.map((r) => r.status).filter(Boolean))], [resources]);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch = !q || (r.name || '').toLowerCase().includes(q) || (r.resourceGroup || '').toLowerCase().includes(q);
      const matchType   = !filterType   || r.type   === filterType;
      const matchRegion = !filterRegion || r.region === filterRegion;
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchType && matchRegion && matchStatus;
    });
  }, [resources, search, filterType, filterRegion, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '9px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            placeholder="Search resources…"
            style={{ ...inputStyle, paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); resetPage(); }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); resetPage(); }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); resetPage(); }} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Status</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Result count */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '10px' }}>
        Showing {paginated.length} of {filtered.length} resources
      </p>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resource Group</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Region</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CPU %</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cost/Day</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No resources found
                </td>
              </tr>
            ) : (
              paginated.map((r, i) => {
                const isIdle = r.cpuPercent !== undefined && r.cpuPercent < 5;
                return (
                  <tr
                    key={r.id || i}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      background: isIdle ? 'rgba(245,158,11,0.04)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isIdle ? 'rgba(245,158,11,0.04)' : 'transparent'; }}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isIdle && (
                          <span title="Idle resource" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                        )}
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)' }}>{r.type}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.resourceGroup}</td>
                    <td style={{ padding: '13px 16px', color: 'var(--text-secondary)' }}>{r.region}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                      {r.cpuPercent !== undefined ? (
                        <span style={{ color: r.cpuPercent < 5 ? '#f59e0b' : r.cpuPercent > 80 ? '#ef4444' : 'var(--text-secondary)' }}>
                          {r.cpuPercent.toFixed(1)}%
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {r.costPerDay !== undefined ? formatCurrency(r.costPerDay) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '16px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginRight: '8px' }}>
            Page {safePage} of {totalPages}
          </span>
          {[
            { icon: ChevronsLeft,  onClick: () => setPage(1),             disabled: safePage === 1 },
            { icon: ChevronLeft,   onClick: () => setPage((p) => p - 1),  disabled: safePage === 1 },
            { icon: ChevronRight,  onClick: () => setPage((p) => p + 1),  disabled: safePage === totalPages },
            { icon: ChevronsRight, onClick: () => setPage(totalPages),    disabled: safePage === totalPages },
          ].map(({ icon: Icon, onClick, disabled }, i) => (
            <button
              key={i}
              onClick={onClick}
              disabled={disabled}
              style={{
                width: '32px', height: '32px', borderRadius: '6px',
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                cursor: disabled ? 'not-allowed' : 'pointer', color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: disabled ? 0.5 : 1, transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = 'var(--border-color)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
