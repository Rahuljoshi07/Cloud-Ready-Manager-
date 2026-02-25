/**
 * Anomaly Detection Service
 * Uses rolling averages and Z-score method to detect cost anomalies.
 */

const ZSCORE_THRESHOLD = 2.0;
const MIN_WINDOW = 7; // minimum days needed for detection

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stddev(values, avg) {
  if (values.length < 2) return 0;
  const m = avg !== undefined ? avg : mean(values);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Detects anomalies in daily cost records using Z-score on a rolling window.
 * @param {Array} costRecords - Array of { date, amount, service, subscriptionId }
 * @returns {Array} anomalies - Records with anomaly metadata
 */
function detectAnomalies(costRecords) {
  if (!costRecords || costRecords.length < MIN_WINDOW) return [];

  // Group by service
  const byService = {};
  costRecords.forEach((record) => {
    const key = `${record.subscriptionId}__${record.service}`;
    if (!byService[key]) byService[key] = [];
    byService[key].push({ date: record.date, amount: parseFloat(record.amount) });
  });

  const anomalies = [];

  Object.entries(byService).forEach(([key, records]) => {
    const sorted = records.sort((a, b) => new Date(a.date) - new Date(b.date));
    const [subscriptionId, service] = key.split('__');

    for (let i = MIN_WINDOW; i < sorted.length; i++) {
      const window = sorted.slice(Math.max(0, i - 14), i).map((r) => r.amount);
      const windowMean = mean(window);
      const windowStd = stddev(window, windowMean);
      const current = sorted[i].amount;

      if (windowStd === 0) continue;

      const zScore = Math.abs((current - windowMean) / windowStd);

      if (zScore > ZSCORE_THRESHOLD) {
        const percentChange = ((current - windowMean) / windowMean) * 100;
        anomalies.push({
          date: sorted[i].date,
          service,
          subscriptionId,
          amount: current,
          expectedAmount: parseFloat(windowMean.toFixed(2)),
          zScore: parseFloat(zScore.toFixed(2)),
          percentChange: parseFloat(percentChange.toFixed(1)),
          severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
          direction: current > windowMean ? 'spike' : 'drop',
        });
      }
    }
  });

  return anomalies.sort((a, b) => b.zScore - a.zScore);
}

/**
 * Calculates trend data for cost records.
 * @param {Array} costRecords - Array of { date, amount }
 * @returns {Object} trend info: slope, direction, percentChange, movingAverage
 */
function calculateTrend(costRecords) {
  if (!costRecords || costRecords.length < 2) {
    return { slope: 0, direction: 'stable', percentChange: 0, movingAverage: [] };
  }

  const sorted = [...costRecords].sort((a, b) => new Date(a.date) - new Date(b.date));
  const amounts = sorted.map((r) => parseFloat(r.amount));
  const n = amounts.length;

  // Simple linear regression
  const xMean = (n - 1) / 2;
  const yMean = mean(amounts);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (amounts[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;

  const firstHalfMean = mean(amounts.slice(0, Math.floor(n / 2)));
  const secondHalfMean = mean(amounts.slice(Math.floor(n / 2)));
  const percentChange =
    firstHalfMean !== 0 ? ((secondHalfMean - firstHalfMean) / firstHalfMean) * 100 : 0;

  // 7-day moving average
  const windowSize = Math.min(7, n);
  const movingAverage = sorted.map((record, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = amounts.slice(start, i + 1);
    return { date: record.date, value: parseFloat(mean(window).toFixed(2)) };
  });

  return {
    slope: parseFloat(slope.toFixed(4)),
    direction: slope > 0.5 ? 'increasing' : slope < -0.5 ? 'decreasing' : 'stable',
    percentChange: parseFloat(percentChange.toFixed(1)),
    movingAverage,
  };
}

module.exports = { detectAnomalies, calculateTrend };
