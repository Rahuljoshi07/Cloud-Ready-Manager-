import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number as currency (default USD)
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a date string or Date object to a readable string
 */
export function formatDate(date, fmt = 'MMM d, yyyy') {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return String(date);
    return format(d, fmt);
  } catch {
    return String(date);
  }
}

/**
 * Format a date as short month + day
 */
export function formatDateShort(date) {
  return formatDate(date, 'MMM d');
}

/**
 * Format a value as a percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Return a CSS color string for a given status
 */
export function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'running':
    case 'active':
    case 'healthy':
    case 'succeeded':
      return 'var(--accent-green)';
    case 'stopped':
    case 'deallocated':
    case 'disabled':
      return 'var(--text-muted)';
    case 'warning':
    case 'degraded':
      return 'var(--accent-amber)';
    case 'failed':
    case 'error':
    case 'unhealthy':
      return 'var(--accent-red)';
    default:
      return 'var(--text-secondary)';
  }
}

/**
 * Return a CSS color string for a given severity level
 */
export function getSeverityColor(severity) {
  const s = (severity || '').toLowerCase();
  switch (s) {
    case 'critical':
      return 'var(--accent-red)';
    case 'high':
      return '#f97316'; // orange
    case 'medium':
    case 'warning':
      return 'var(--accent-amber)';
    case 'low':
    case 'info':
      return 'var(--accent-blue)';
    default:
      return 'var(--text-secondary)';
  }
}

/**
 * Get badge variant string based on status
 */
export function getStatusBadgeVariant(status) {
  const s = (status || '').toLowerCase();
  switch (s) {
    case 'running':
    case 'active':
    case 'healthy':
      return 'success';
    case 'warning':
    case 'degraded':
      return 'warning';
    case 'failed':
    case 'error':
      return 'danger';
    case 'stopped':
    case 'deallocated':
      return 'default';
    default:
      return 'info';
  }
}

/**
 * Get badge variant string based on severity
 */
export function getSeverityBadgeVariant(severity) {
  const s = (severity || '').toLowerCase();
  switch (s) {
    case 'critical':
    case 'high':
      return 'danger';
    case 'medium':
    case 'warning':
      return 'warning';
    case 'low':
    case 'info':
      return 'info';
    default:
      return 'default';
  }
}
