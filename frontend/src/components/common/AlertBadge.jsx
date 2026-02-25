import React from 'react';

const severityConfig = {
  critical: { label: 'Critical', className: 'badge-critical' },
  high: { label: 'High', className: 'badge-high' },
  medium: { label: 'Medium', className: 'badge-medium' },
  low: { label: 'Low', className: 'badge-low' },
};

const AlertBadge = ({ severity }) => {
  const config = severityConfig[severity?.toLowerCase()] || { label: severity, className: 'badge-info' };
  return (
    <span className={`badge ${config.className}`}>
      {config.label}
    </span>
  );
};

export default AlertBadge;
