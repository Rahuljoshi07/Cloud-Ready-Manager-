/**
 * Simple linear regression based cost forecasting service
 */

function linearRegression(data) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumX2 += i * i;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function forecastCosts(historicalData, daysToForecast = 30) {
  if (!historicalData || historicalData.length === 0) return [];

  const amounts = historicalData.map(d => d.total || d.amount || 0);
  const { slope, intercept } = linearRegression(amounts);
  const n = amounts.length;

  const forecasts = [];
  const today = new Date();

  for (let i = 1; i <= daysToForecast; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + i);

    const predictedValue = intercept + slope * (n + i - 1);
    const variance = amounts.reduce((acc, val, idx) => {
      const predicted = intercept + slope * idx;
      return acc + Math.pow(val - predicted, 2);
    }, 0) / n;

    const stdError = Math.sqrt(variance) * 1.96;
    const yearMonth = futureDate.getFullYear() + '-' + String(futureDate.getMonth() + 1).padStart(2, '0') + '-' + String(futureDate.getDate()).padStart(2, '0');

    forecasts.push({
      date: yearMonth,
      forecast: parseFloat(Math.max(0, predictedValue).toFixed(2)),
      lower_bound: parseFloat(Math.max(0, predictedValue - stdError).toFixed(2)),
      upper_bound: parseFloat((predictedValue + stdError).toFixed(2))
    });
  }

  return forecasts;
}

function calculateMonthlyForecast(dailyData) {
  if (!dailyData || dailyData.length === 0) return 0;
  const amounts = dailyData.map(d => d.total || d.amount || 0);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const { slope } = linearRegression(amounts);
  const daysInMonth = 30;
  const projected = (avg + slope * (daysInMonth / 2)) * daysInMonth;
  return parseFloat(Math.max(0, projected).toFixed(2));
}

module.exports = { forecastCosts, calculateMonthlyForecast, linearRegression };
