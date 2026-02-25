import React from 'react';

export default function LoadingSpinner({ size = 'md', centered = true, text }) {
  const sizeClass = `spinner spinner-${size}`;

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div className={sizeClass} />
      {text && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );

  if (centered) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
