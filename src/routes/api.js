const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Health check endpoint
router.get('/health', healthController.healthCheck);

// Readiness probe
router.get('/ready', healthController.readinessCheck);

// Application info
router.get('/info', (req, res) => {
  res.json({
    application: 'AzureFlow - CI/CD Pipeline Demo',
    version: '1.0.0',
    description: 'Automated deployment to Azure App Service',
    author: 'Your Name',
    technologies: [
      'Node.js',
      'Express.js',
      'GitHub Actions',
      'Azure App Service',
      'Docker'
    ],
    features: [
      'Automated Testing',
      'Continuous Integration',
      'Continuous Deployment',
      'Health Monitoring',
      'Docker Containerization'
    ]
  });
});

// System status endpoint
router.get('/status', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'operational',
    uptime: `${Math.floor(uptime / 60)} minutes`,
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
    },
    platform: process.platform,
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});

// Sample data endpoint
router.get('/data', (req, res) => {
  res.json({
    message: 'Sample data endpoint',
    data: [
      { id: 1, name: 'CI/CD Pipeline', status: 'active' },
      { id: 2, name: 'Azure Deployment', status: 'success' },
      { id: 3, name: 'Automated Testing', status: 'passed' }
    ]
  });
});

module.exports = router;
