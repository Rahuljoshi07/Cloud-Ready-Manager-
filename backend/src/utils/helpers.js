/**
 * Shared date/format helpers used across services.
 */

function format(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function eachDayOfInterval(start, end) {
  const dates = [];
  for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

function parseISO(str) {
  return new Date(str);
}

function paginateArray(array, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize;
  return {
    data: array.slice(start, start + pageSize),
    pagination: {
      total: array.length,
      page,
      pageSize,
      totalPages: Math.ceil(array.length / pageSize),
    },
  };
}

function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function errorResponse(res, message, statusCode = 500, errors = null) {
  const payload = { success: false, error: message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

module.exports = {
  format,
  subDays,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  paginateArray,
  successResponse,
  errorResponse,
};
