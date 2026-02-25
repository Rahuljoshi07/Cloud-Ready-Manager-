import React from 'react';

const variantStyles = {
  success: { background: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  warning: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  danger:  { background: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  info:    { background: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  purple:  { background: 'rgba(168,85,247,0.15)', color: '#a855f7' },
  default: { background: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

export default function Badge({ children, variant = 'default', style = {} }) {
  const vs = variantStyles[variant] || variantStyles.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        letterSpacing: '0.02em',
        ...vs,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
