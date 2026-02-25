import React from 'react';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', flexDirection: 'column', gap: 12,
        zIndex: 9999,
      }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{message}</span>
      </div>
    );
  }

  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <span>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
