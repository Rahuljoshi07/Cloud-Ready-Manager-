require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');

const { pool } = require('./db');
const authRoutes = require('./routes/auth');
const costRoutes = require('./routes/costs');
const resourceRoutes = require('./routes/resources');
const alertRoutes = require('./routes/alerts');
const budgetRoutes = require('./routes/budgets');
const recommendationRoutes = require('./routes/recommendations');
const reportRoutes = require('./routes/reports');

const azureService = require('./services/azureService');
const CostRecord = require('./models/CostRecord');
const Resource = require('./models/Resource');
const Alert = require('./models/Alert');
const Recommendation = require('./models/Recommendation');
const Budget = require('./models/Budget');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reports', reportRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Database initialisation & seeding ────────────────────────────────────────
async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cost_records (
        id SERIAL PRIMARY KEY,
        subscription_id VARCHAR(255),
        resource_group VARCHAR(255),
        service_name VARCHAR(255),
        region VARCHAR(255),
        cost DECIMAL(10,2),
        currency VARCHAR(10) DEFAULT 'USD',
        usage_date DATE,
        tags JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        resource_id VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        type VARCHAR(255),
        resource_group VARCHAR(255),
        subscription_id VARCHAR(255),
        region VARCHAR(255),
        status VARCHAR(50),
        cpu_utilization DECIMAL(5,2),
        memory_utilization DECIMAL(5,2),
        monthly_cost DECIMAL(10,2),
        tags JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        severity VARCHAR(50),
        message TEXT,
        resource_id VARCHAR(255),
        subscription_id VARCHAR(255),
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS recommendations (
        id SERIAL PRIMARY KEY,
        type VARCHAR(100),
        resource_id VARCHAR(255),
        resource_name VARCHAR(255),
        description TEXT,
        potential_savings DECIMAL(10,2),
        action VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        subscription_id VARCHAR(255),
        amount DECIMAL(10,2),
        period VARCHAR(50) DEFAULT 'monthly',
        current_spend DECIMAL(10,2) DEFAULT 0,
        threshold_percentage INTEGER DEFAULT 80,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Database schema initialised');
  } finally {
    client.release();
  }
}

async function seedDatabase() {
  try {
    // Check if already seeded
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('ℹ️  Database already seeded, skipping.');
      return;
    }

    console.log('🌱 Seeding database with mock data...');

    // Admin user
    const adminHash = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({ email: 'admin@azurecost.io', password_hash: adminHash, name: 'Admin User', role: 'admin' });

    // Viewer user
    const viewerHash = await bcrypt.hash('viewer123', 12);
    await User.create({ email: 'viewer@azurecost.io', password_hash: viewerHash, name: 'Jane Viewer', role: 'viewer' });

    // Cost records
    const costRecords = azureService.generateDailyCosts(60);
    for (const record of costRecords) {
      await CostRecord.create(record);
    }
    console.log(`  ✓ Inserted ${costRecords.length} cost records`);

    // Resources
    const resources = azureService.generateResources();
    for (const resource of resources) {
      await Resource.create(resource);
    }
    console.log(`  ✓ Inserted ${resources.length} resources`);

    // Alerts
    const alerts = azureService.generateAlerts();
    for (const alert of alerts) {
      await Alert.create(alert);
    }
    console.log(`  ✓ Inserted ${alerts.length} alerts`);

    // Recommendations
    const recs = azureService.generateRecommendations();
    for (const rec of recs) {
      await Recommendation.create(rec);
    }
    console.log(`  ✓ Inserted ${recs.length} recommendations`);

    // Budgets
    const budgetDefs = [
      { name: 'Production Monthly Budget', subscription_id: 'sub-prod-001', amount: 15000, period: 'monthly', threshold_percentage: 80, current_spend: 12500 },
      { name: 'Development Budget', subscription_id: 'sub-dev-002', amount: 3000, period: 'monthly', threshold_percentage: 90, current_spend: 1800 },
      { name: 'Staging Budget', subscription_id: 'sub-staging-003', amount: 5000, period: 'monthly', threshold_percentage: 85, current_spend: 3200 },
    ];
    for (const b of budgetDefs) {
      await Budget.create({ ...b, user_id: adminUser.id });
    }
    console.log(`  ✓ Inserted ${budgetDefs.length} budgets`);

    console.log('✅ Database seeded successfully');
    console.log('   👤 Admin: admin@azurecost.io / admin123');
    console.log('   👤 Viewer: viewer@azurecost.io / viewer123');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

// ── Cron jobs ─────────────────────────────────────────────────────────────────
// Daily cost sync at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running daily cost sync...');
  try {
    const records = azureService.generateDailyCosts(1);
    for (const record of records) {
      await CostRecord.create(record);
    }
    console.log(`✅ Daily sync: inserted ${records.length} records`);
  } catch (err) {
    console.error('Daily sync failed:', err.message);
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

async function startServer() {
  let retries = 10;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected');
      break;
    } catch (err) {
      retries--;
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  if (retries === 0) {
    console.error('❌ Could not connect to database. Exiting.');
    process.exit(1);
  }

  await initDatabase();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

module.exports = app;
