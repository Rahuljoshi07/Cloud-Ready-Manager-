/**
 * Anomaly Detection Service using Z-Score statistical analysis
 */

/**
 * Calculate mean of an array
 */
function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Calculate standard deviation
 */
function stdDev(arr) {
  const m = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Calculate Z-score for a value given a dataset
 */
function zScore(value, dataset) {
  const m = mean(dataset);
  const s = stdDev(dataset);
  if (s === 0) return 0;
  return (value - m) / s;
}

/**
 * Detect anomalies in a time-series cost dataset
 * @param {Array} records - Array of { usage_date, total_cost } objects
 * @param {number} threshold - Z-score threshold (default: 2.5)
 * @returns {Array} anomalous records with z_score and severity
 */
function detectAnomalies(records, threshold = 2.5) {
  if (!records || records.length < 7) {
    return [];
  }

  const costs = records.map(r => parseFloat(r.total_cost));
  const anomalies = [];

  // Use rolling window for contextual anomaly detection
  const windowSize = Math.min(14, Math.floor(records.length / 2));

  for (let i = windowSize; i < records.length; i++) {
    const window = costs.slice(i - windowSize, i);
    const currentCost = costs[i];
    const score = zScore(currentCost, window);

    if (Math.abs(score) >= threshold) {
      const severity = Math.abs(score) >= 4 ? 'critical' : Math.abs(score) >= 3 ? 'high' : 'medium';
      const direction = score > 0 ? 'spike' : 'drop';
      const percentChange = ((currentCost - mean(window)) / mean(window) * 100).toFixed(1);

      anomalies.push({
        date: records[i].usage_date,
        cost: currentCost,
        baseline: parseFloat(mean(window).toFixed(2)),
        z_score: parseFloat(score.toFixed(3)),
        severity,
        direction,
        percent_change: parseFloat(percentChange),
        message: `Cost ${direction} of ${Math.abs(percentChange)}% detected (${Math.abs(score).toFixed(1)}σ from baseline)`,
      });
    }
  }

  return anomalies;
}

/**
 * Detect service-level anomalies by comparing current period to historical
 * @param {Array} currentPeriod - costs for current period by service
 * @param {Array} historicalPeriod - costs for historical period by service
 */
function detectServiceAnomalies(currentPeriod, historicalPeriod) {
  const anomalies = [];

  for (const current of currentPeriod) {
    const historical = historicalPeriod.filter(h => h.service_name === current.service_name);
    if (historical.length < 3) continue;

    const historicalCosts = historical.map(h => parseFloat(h.total_cost));
    const score = zScore(parseFloat(current.total_cost), historicalCosts);

    if (Math.abs(score) >= 2.0) {
      const historicalMean = mean(historicalCosts);
      const pctChange = ((current.total_cost - historicalMean) / historicalMean * 100).toFixed(1);
      const severity = Math.abs(score) >= 3 ? 'high' : 'medium';

      anomalies.push({
        service: current.service_name,
        current_cost: parseFloat(current.total_cost),
        historical_mean: parseFloat(historicalMean.toFixed(2)),
        z_score: parseFloat(score.toFixed(3)),
        percent_change: parseFloat(pctChange),
        severity,
        message: `${current.service_name} costs are ${Math.abs(pctChange)}% ${parseFloat(pctChange) > 0 ? 'above' : 'below'} historical average`,
      });
    }
  }

  return anomalies;
}

/**
 * Calculate cost volatility index (coefficient of variation)
 */
function volatilityIndex(costSeries) {
  if (!costSeries || costSeries.length === 0) return 0;
  const costs = costSeries.map(c => parseFloat(c));
  const m = mean(costs);
  if (m === 0) return 0;
  const cv = (stdDev(costs) / m) * 100;
  return parseFloat(cv.toFixed(2));
}

module.exports = {
  detectAnomalies,
  detectServiceAnomalies,
  volatilityIndex,
  zScore,
  mean,
  stdDev,
};
