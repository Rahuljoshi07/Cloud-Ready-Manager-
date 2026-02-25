const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
