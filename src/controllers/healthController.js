/**
 * Health Check Controller
 * Provides health and readiness endpoints for monitoring
 */

// Health check endpoint
const healthCheck = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Application is running successfully'
  });
};

// Readiness check endpoint
const readinessCheck = (req, res) => {
  // Check if application is ready to accept traffic
  const isReady = true; // Add actual readiness checks here
  
  if (isReady) {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      message: 'Application is ready to accept requests'
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Application is not ready to accept requests'
    });
  }
};

module.exports = {
  healthCheck,
  readinessCheck
};
