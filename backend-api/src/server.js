const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const { apiLimiter, strictLimiter } = require('./middleware/rateLimiter');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API Documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Backend API',
    version: '1.0.0',
    status: 'operational',
    documentation: {
      health: 'GET /health - Health check endpoint',
      users: {
        getAll: 'GET /api/users - Get all users',
        getOne: 'GET /api/users/:id - Get user by ID',
        create: 'POST /api/users - Create new user (name, email, age)',
        update: 'PUT /api/users/:id - Update user',
        delete: 'DELETE /api/users/:id - Delete user'
      },
      products: {
        getAll: 'GET /api/products - Get all products',
        getOne: 'GET /api/products/:id - Get product by ID',
        create: 'POST /api/products - Create new product (name, description, price, stock)',
        update: 'PUT /api/products/:id - Update product',
        delete: 'DELETE /api/products/:id - Delete product'
      }
    },
    limits: {
      general: '100 requests per 15 minutes',
      writes: '50 write operations per 15 minutes'
    }
  });
});

// Routes with rate limiting
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;
