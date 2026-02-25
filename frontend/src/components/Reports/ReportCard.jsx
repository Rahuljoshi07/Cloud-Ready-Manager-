import React from 'react';
import { Download, FileText, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';

const reportTypeColors = {
  CostSummary:    '#3b82f6',
  ResourceUsage:  '#22c55e',
  Recommendations:'#f59e0b',
  Compliance:     '#a855f7',
  BudgetAnalysis: '#06b6d4',
};

function getStatusVariant(status) {
  switch ((status || '').toLowerCase()) {
    case 'completed': return 'success';
    case 'generating':
    case 'pending':   return 'warning';
    case 'failed':    return 'danger';
    default:          return 'default';
  }
}

export default function ReportCard({ report, onDownload }) {
  if (!report) return null;
  const color = reportTypeColors[report.reportType] || '#3b82f6';

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div
        style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: `${color}18`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}
      >
        <FileText size={20} color={color} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.875rem', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {report.name || report.reportType}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{report.reportType}</span>
          <span style={{ color: 'var(--border-color)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <Clock size={11} />
            {formatDate(report.generatedAt || report.createdAt)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <Badge variant={getStatusVariant(report.status)}>{report.status || 'completed'}</Badge>
        {report.status === 'completed' && onDownload && (
          <button
            onClick={() => onDownload(report)}
            title="Download report"
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#3b82f620'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Download size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
