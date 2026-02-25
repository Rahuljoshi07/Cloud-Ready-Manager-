/**
 * Forecasting Service
 * Linear regression and monthly extrapolation for cost forecasting.
 */

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Linear regression forecast for the next `days` days.
 * @param {Array} historicalData - Array of { date, amount }
 * @param {number} days - Number of days to forecast
 * @returns {Array} Array of { date, forecastedAmount, lowerBound, upperBound }
 */
function forecastCosts(historicalData, days = 30) {
  if (!historicalData || historicalData.length < 3) return [];

  const sorted = [...historicalData].sort((a, b) => new Date(a.date) - new Date(b.date));
  const amounts = sorted.map((r) => parseFloat(r.amount));
  const n = amounts.length;

  // Linear regression coefficients
  const xMean = (n - 1) / 2;
  const yMean = mean(amounts);
  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (amounts[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  // Residual standard error for confidence interval
  const residuals = amounts.map((a, i) => a - (intercept + slope * i));
  const rse = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / Math.max(n - 2, 1));
  const margin = rse * 1.96; // 95% confidence

  const lastDate = new Date(sorted[sorted.length - 1].date);
  const forecasts = [];

  for (let d = 1; d <= days; d++) {
    const futureDate = new Date(lastDate);
    futureDate.setDate(futureDate.getDate() + d);
    const x = n - 1 + d;
    const predicted = Math.max(0, intercept + slope * x);
    forecasts.push({
      date: futureDate.toISOString().split('T')[0],
      forecastedAmount: parseFloat(predicted.toFixed(2)),
      lowerBound: parseFloat(Math.max(0, predicted - margin).toFixed(2)),
      upperBound: parseFloat((predicted + margin).toFixed(2)),
    });
  }

  return forecasts;
}

/**
 * Extrapolates daily costs to end-of-month forecast.
 * @param {Array} dailyCosts - Array of { date, amount } for current month so far
 * @returns {Object} { currentSpend, projectedMonthly, daysElapsed, daysInMonth }
 */
function calculateMonthlyForecast(dailyCosts) {
  if (!dailyCosts || !dailyCosts.length) {
    return { currentSpend: 0, projectedMonthly: 0, daysElapsed: 0, daysInMonth: 30 };
  }

  const sorted = [...dailyCosts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const lastDate = new Date(sorted[sorted.length - 1].date);
  const year = lastDate.getFullYear();
  const month = lastDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysElapsed = sorted.length;

  const currentSpend = sorted.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const dailyAvg = currentSpend / daysElapsed;
  const projectedMonthly = parseFloat((dailyAvg * daysInMonth).toFixed(2));

  return {
    currentSpend: parseFloat(currentSpend.toFixed(2)),
    projectedMonthly,
    daysElapsed,
    daysInMonth,
    dailyAverage: parseFloat(dailyAvg.toFixed(2)),
    remainingDays: daysInMonth - daysElapsed,
    remainingCost: parseFloat((dailyAvg * (daysInMonth - daysElapsed)).toFixed(2)),
  };
}

module.exports = { forecastCosts, calculateMonthlyForecast };
