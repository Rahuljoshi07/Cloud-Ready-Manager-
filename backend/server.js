require('dotenv').config();
const cron = require('node-cron');
const app = require('./src/app');
const { sequelize, User, CostRecord, Resource, Recommendation, Alert, Budget } = require('./src/models');
const azureService = require('./src/services/azureService');
const { processAlerts } = require('./src/services/notificationService');
const { detectAnomalies } = require('./src/services/anomalyDetectionService');
const bcrypt = require('bcryptjs');
const { format, subDays } = require('./src/utils/helpers');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Seeds the database with 90 days of historical mock data.
 * Only runs if the database is empty.
 */
async function seedDatabase() {
  try {
    const existingCount = await CostRecord.count();
    if (existingCount > 0) {
      console.log('[Seed] Database already populated, skipping seed.');
      return;
    }

    console.log('[Seed] Starting database seed with mock Azure data...');

    // Create default admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    const [admin] = await User.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL || 'admin@contoso.com' },
      defaults: {
        name: 'Azure Admin',
        password: adminPassword,
        role: 'admin',
        subscriptions: ['sub-001-prod', 'sub-002-dev', 'sub-003-staging'],
        notificationPreferences: { email: true, slack: false, budgetAlerts: true, anomalyAlerts: true, weeklyReport: true },
      },
    });

    // Create a viewer demo user
    const viewerPassword = await bcrypt.hash('Viewer@123', 12);
    const [viewer] = await User.findOrCreate({
      where: { email: 'viewer@contoso.com' },
      defaults: {
        name: 'Demo Viewer',
        password: viewerPassword,
        role: 'viewer',
        subscriptions: ['sub-001-prod'],
      },
    });

    // Seed 90 days of cost records for all subscriptions
    const endDate = new Date();
    const startDate = subDays(endDate, 90);
    const subscriptions = azureService.getSubscriptions();

    for (const sub of subscriptions) {
      console.log(`[Seed] Seeding cost records for ${sub.name}...`);
      const records = azureService.getCostData(sub.id, format(startDate), format(endDate));
      const batchSize = 500;
      for (let i = 0; i < records.length; i += batchSize) {
        await CostRecord.bulkCreate(records.slice(i, i + batchSize), { ignoreDuplicates: true });
      }
    }

    // Seed resources
    for (const sub of subscriptions) {
      console.log(`[Seed] Seeding resources for ${sub.name}...`);
      const resources = azureService.getResources(sub.id);
      for (const r of resources) {
        await Resource.findOrCreate({ where: { resourceId: r.resourceId }, defaults: r });
      }
    }

    // Seed recommendations
    const allResources = await Resource.findAll({ limit: 20, raw: true });
    const recTemplates = [
      { type: 'resize', title: 'Downsize over-provisioned VM', description: 'This VM is running at <15% CPU. Downsize from Standard_D4s_v3 to Standard_D2s_v3 to save costs.', estimatedSavings: 245.60, priority: 'high' },
      { type: 'stop', title: 'Stop idle development VM', description: 'VM has been running with <5% CPU for 30 days. Stop it outside business hours or delete if no longer needed.', estimatedSavings: 189.40, priority: 'high' },
      { type: 'reserve', title: 'Purchase Reserved Instance for SQL', description: 'Azure SQL Database has had consistent usage for 60+ days. 1-year reserved instance saves ~40%.', estimatedSavings: 312.00, priority: 'high' },
      { type: 'rightsize', title: 'Rightsize App Service Plan', description: 'App Service Plan is using <20% of provisioned capacity. Move to a smaller SKU.', estimatedSavings: 98.50, priority: 'medium' },
      { type: 'delete', title: 'Delete unattached managed disks', description: 'Found 4 managed disks not attached to any VM. Delete them to eliminate storage costs.', estimatedSavings: 56.80, priority: 'medium' },
      { type: 'hybrid', title: 'Apply Azure Hybrid Benefit to Windows VMs', description: 'Use existing Windows Server licenses with Azure Hybrid Benefit to reduce VM costs by up to 40%.', estimatedSavings: 420.00, priority: 'high' },
      { type: 'resize', title: 'Scale down AKS node pool during off-peak', description: 'AKS cluster has low utilization on weekends. Enable cluster autoscaler to reduce node count.', estimatedSavings: 175.20, priority: 'medium' },
      { type: 'reserve', title: 'Reserve Cosmos DB throughput', description: 'Cosmos DB has stable throughput requirements. Reserve provisioned throughput for 40% savings.', estimatedSavings: 280.00, priority: 'medium' },
      { type: 'stop', title: 'Deallocate staging VMs overnight', description: 'Staging environment VMs run 24/7 but are only used during business hours. Automate shutdown.', estimatedSavings: 134.70, priority: 'low' },
      { type: 'delete', title: 'Remove unused public IP addresses', description: '6 reserved public IP addresses are not associated with any resource. Release them.', estimatedSavings: 28.80, priority: 'low' },
      { type: 'resize', title: 'Reduce Azure Cache for Redis tier', description: 'Redis cache hit ratio is high but memory usage is <30%. Downgrade from P1 to C2.', estimatedSavings: 145.00, priority: 'medium' },
      { type: 'hybrid', title: 'Apply Azure Hybrid Benefit to SQL', description: 'Use existing SQL Server license with Azure Hybrid Benefit on Azure SQL Managed Instance.', estimatedSavings: 560.00, priority: 'high' },
    ];

    for (let i = 0; i < recTemplates.length; i++) {
      const resource = allResources[i % allResources.length];
      await Recommendation.create({
        ...recTemplates[i],
        subscriptionId: resource?.subscriptionId || 'sub-001-prod',
        resourceId: resource?.resourceId,
        resourceGroup: resource?.resourceGroup || 'rg-production-core',
        savingsCurrency: 'USD',
        savingsPeriod: 'monthly',
        impactedService: resource?.resourceType,
      });
    }

    // Seed budgets for admin
    const budgetDefs = [
      { name: 'Production Monthly Budget', amount: 25000, subscriptionId: 'sub-001-prod', period: 'monthly', alertThreshold: 80 },
      { name: 'Development Monthly Budget', amount: 8000, subscriptionId: 'sub-002-dev', period: 'monthly', alertThreshold: 85 },
      { name: 'Staging Monthly Budget', amount: 12000, subscriptionId: 'sub-003-staging', period: 'monthly', alertThreshold: 80 },
    ];
    for (const bd of budgetDefs) {
      await Budget.findOrCreate({
        where: { userId: admin.id, subscriptionId: bd.subscriptionId },
        defaults: { ...bd, userId: admin.id, currency: 'USD' },
      });
    }

    // Seed some sample alerts
    const alertDefs = [
      { type: 'anomaly', severity: 'high', title: 'Cost Spike Detected: Virtual Machines', message: 'Virtual Machine costs increased by 34% compared to the 14-day rolling average on production subscription.', subscriptionId: 'sub-001-prod', status: 'active' },
      { type: 'budget', severity: 'medium', title: 'Budget Warning: Production', message: 'Production subscription has reached 78% of the monthly budget ($19,500 / $25,000).', subscriptionId: 'sub-001-prod', status: 'active' },
      { type: 'recommendation', severity: 'low', title: 'New Optimization Opportunities', message: '3 new cost optimization recommendations are available totaling $875/month in savings.', subscriptionId: 'sub-001-prod', status: 'active' },
    ];
    for (const ad of alertDefs) {
      await Alert.create({ ...ad, userId: admin.id });
    }

    console.log('[Seed] Database seeding complete!');
    console.log(`[Seed] Admin login: ${process.env.ADMIN_EMAIL || 'admin@contoso.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('[Seed] Viewer login: viewer@contoso.com / Viewer@123');
  } catch (err) {
    console.error('[Seed] Error seeding database:', err.message);
  }
}

/**
 * Scheduled job: refresh resource utilization data every hour.
 */
function scheduleJobs() {
  // Every hour: sync latest Azure data and run anomaly detection
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Hourly: checking budgets and processing alerts...');
    await processAlerts();
  });

  // Daily at 02:00: detect anomalies and create alert records
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Daily: running anomaly detection...');
    const { detectAnomalies } = require('./src/services/anomalyDetectionService');
    const subscriptions = azureService.getSubscriptions();
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) return;

    for (const sub of subscriptions) {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const records = await CostRecord.findAll({
        where: { subscriptionId: sub.id, date: { [require('sequelize').Op.gte]: thirtyDaysAgo } },
        raw: true,
      });
      const anomalies = detectAnomalies(records);
      for (const a of anomalies.slice(0, 5)) {
        await Alert.create({
          userId: adminUser.id,
          type: 'anomaly',
          severity: a.severity,
          title: `Cost ${a.direction === 'spike' ? 'Spike' : 'Drop'}: ${a.service}`,
          message: `${a.service} costs were $${a.amount} on ${a.date}, ${Math.abs(a.percentChange)}% ${a.direction === 'spike' ? 'above' : 'below'} the expected $${a.expectedAmount} (Z-score: ${a.zScore}).`,
          subscriptionId: a.subscriptionId,
          metadata: a,
        });
      }
    }
  });

  console.log('[Cron] Scheduled jobs registered.');
}

async function startServer() {
  try {
    // Sync database schema (alter: true is safe for development; use migrations in production)
    await sequelize.sync({ alter: NODE_ENV === 'development' });
    console.log('[DB] Database synchronized.');

    await seedDatabase();
    scheduleJobs();

    app.listen(PORT, () => {
      console.log(`[Server] Azure Cost Monitor API running on port ${PORT} (${NODE_ENV})`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
