/**
 * Anomaly detection service using Z-score statistical method
 */

function detectAnomalies(data, field = 'amount', threshold = 2.0) {
  if (!data || data.length < 3) return data.map(d => ({ ...d, is_anomaly: false }));

  const values = data.map(d => parseFloat(d[field]) || 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return data.map((item, idx) => {
    const value = values[idx];
    const zScore = stdDev > 0 ? Math.abs((value - mean) / stdDev) : 0;
    const isAnomaly = zScore > threshold;
    return {
      ...item,
      is_anomaly: isAnomaly,
      z_score: parseFloat(zScore.toFixed(2)),
      deviation_pct: mean > 0 ? parseFloat(((value - mean) / mean * 100).toFixed(1)) : 0
    };
  });
}

function getAnomalySummary(data, field = 'amount') {
  const labeled = detectAnomalies(data, field);
  const anomalies = labeled.filter(d => d.is_anomaly);
  return {
    total_records: data.length,
    anomaly_count: anomalies.length,
    anomalies
  };
}

module.exports = { detectAnomalies, getAnomalySummary };
