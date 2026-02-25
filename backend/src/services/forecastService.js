/**
 * Forecast Service - Linear regression and trend analysis for cost forecasting
 */

/**
 * Simple linear regression
 * @param {Array} xValues - x values (time indices)
 * @param {Array} yValues - y values (costs)
 * @returns {{ slope, intercept, r2 }}
 */
function linearRegression(xValues, yValues) {
  const n = xValues.length;
  if (n < 2) return { slope: 0, intercept: yValues[0] || 0, r2: 0 };

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  const ssTot = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssRes = yValues.reduce((sum, y, i) => sum + Math.pow(y - (slope * xValues[i] + intercept), 2), 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2: parseFloat(r2.toFixed(4)) };
}

/**
 * Forecast future costs using linear regression
 * @param {Array} historicalData - Array of { usage_date, total_cost } ordered by date
 * @param {number} forecastDays - Number of days to forecast
 * @returns {Array} forecasted data points
 */
function forecastCosts(historicalData, forecastDays = 30) {
  if (!historicalData || historicalData.length < 7) {
    return [];
  }

  const xValues = historicalData.map((_, i) => i);
  const yValues = historicalData.map(d => parseFloat(d.total_cost));

  const { slope, intercept, r2 } = linearRegression(xValues, yValues);

  const forecasts = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].usage_date);
  const n = historicalData.length;

  // Calculate residual standard error for confidence intervals
  const predictions = xValues.map(x => slope * x + intercept);
  const residuals = yValues.map((y, i) => y - predictions[i]);
  const mse = residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2);
  const se = Math.sqrt(mse);

  for (let d = 1; d <= forecastDays; d++) {
    const x = n + d - 1;
    const predictedCost = Math.max(0, slope * x + intercept);

    // 95% confidence interval
    const margin = 1.96 * se * Math.sqrt(1 + 1 / n + Math.pow(x - (n - 1) / 2, 2) / xValues.reduce((sum, xi) => sum + Math.pow(xi - (n - 1) / 2, 2), 0));

    const date = new Date(lastDate);
    date.setDate(date.getDate() + d);

    forecasts.push({
      date: date.toISOString().split('T')[0],
      predicted_cost: parseFloat(predictedCost.toFixed(2)),
      lower_bound: parseFloat(Math.max(0, predictedCost - margin).toFixed(2)),
      upper_bound: parseFloat((predictedCost + margin).toFixed(2)),
      confidence: parseFloat((r2 * 100).toFixed(1)),
    });
  }

  return forecasts;
}

/**
 * Calculate projected end-of-month cost based on current spending
 * @param {number} currentMonthSpend - Total spend so far this month
 * @param {number} daysElapsed - Days elapsed in current month
 * @param {number} totalDaysInMonth - Total days in month
 */
function projectEndOfMonth(currentMonthSpend, daysElapsed, totalDaysInMonth) {
  if (daysElapsed === 0) return currentMonthSpend;
  const dailyRate = currentMonthSpend / daysElapsed;
  const projected = dailyRate * totalDaysInMonth;
  return parseFloat(projected.toFixed(2));
}

/**
 * Calculate month-over-month growth rate
 * @param {number} previousMonth - Previous month total
 * @param {number} currentMonth - Current month total
 */
function monthOverMonthGrowth(previousMonth, currentMonth) {
  if (previousMonth === 0) return 0;
  return parseFloat(((currentMonth - previousMonth) / previousMonth * 100).toFixed(2));
}

/**
 * Forecast monthly budget impact
 * @param {Array} historicalMonthly - Monthly cost totals
 * @param {number} budgetAmount - Budget limit
 * @returns months until budget breach based on trend
 */
function forecastBudgetBreach(historicalMonthly, budgetAmount) {
  if (!historicalMonthly || historicalMonthly.length < 3) {
    return null;
  }

  const xValues = historicalMonthly.map((_, i) => i);
  const yValues = historicalMonthly.map(d => parseFloat(d.total_cost));
  const { slope, intercept } = linearRegression(xValues, yValues);

  const n = historicalMonthly.length;
  let monthsToBreech = null;

  for (let m = 0; m <= 24; m++) {
    const projected = slope * (n + m) + intercept;
    if (projected >= budgetAmount) {
      monthsToBreech = m;
      break;
    }
  }

  return monthsToBreech;
}

module.exports = {
  linearRegression,
  forecastCosts,
  projectEndOfMonth,
  monthOverMonthGrowth,
  forecastBudgetBreach,
};
