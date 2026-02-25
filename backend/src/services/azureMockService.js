const { subDays, format } = require('../utils/dateUtils');

const AZURE_SERVICES = [
  'Virtual Machines', 'Azure Storage', 'Azure SQL Database', 'Azure Kubernetes Service',
  'Azure App Service', 'Azure Functions', 'Azure CDN', 'Azure Cosmos DB',
  'Azure Redis Cache', 'Azure Service Bus', 'Azure Event Hub', 'Azure Blob Storage',
  'Azure Monitor', 'Azure Backup', 'Azure Load Balancer', 'Azure VPN Gateway'
];

const AZURE_REGIONS = [
  'East US', 'West US 2', 'West Europe', 'North Europe',
  'Southeast Asia', 'Australia East', 'UK South', 'Canada Central',
  'Japan East', 'Brazil South'
];

const RESOURCE_GROUPS = [
  'rg-production', 'rg-staging', 'rg-development', 'rg-analytics',
  'rg-networking', 'rg-security', 'rg-databases', 'rg-monitoring'
];

const SUBSCRIPTION_ID = 'sub-a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function generateMonthlyCosts() {
  const costs = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = format(date);

    // Base daily cost with weekly pattern (lower on weekends)
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseCost = isWeekend ? randomBetween(1800, 2500) : randomBetween(2500, 3800);

    // Add random spike for anomaly demo
    const hasSpike = Math.random() < 0.08;
    const spikeFactor = hasSpike ? randomBetween(1.8, 2.5) : 1;

    AZURE_SERVICES.slice(0, 8).forEach(service => {
      const serviceMultipliers = {
        'Virtual Machines': 0.35,
        'Azure Storage': 0.12,
        'Azure SQL Database': 0.18,
        'Azure Kubernetes Service': 0.15,
        'Azure App Service': 0.08,
        'Azure Functions': 0.03,
        'Azure CDN': 0.04,
        'Azure Cosmos DB': 0.05
      };
      const multiplier = serviceMultipliers[service] || 0.05;
      const amount = parseFloat((baseCost * multiplier * spikeFactor * randomBetween(0.9, 1.1)).toFixed(2));
      const region = AZURE_REGIONS[randomInt(0, 3)];
      const resourceGroup = RESOURCE_GROUPS[randomInt(0, RESOURCE_GROUPS.length - 1)];

      costs.push({
        subscription_id: SUBSCRIPTION_ID,
        resource_group: resourceGroup,
        service_name: service,
        region,
        amount,
        currency: 'USD',
        usage_date: dateStr,
        tags: { environment: resourceGroup.includes('prod') ? 'production' : 'non-production' }
      });
    });
  }
  return costs;
}

function generateResources() {
  const resources = [
    { name: 'vm-web-prod-01', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-production', region: 'East US', cpu: randomBetween(75, 92), mem: randomBetween(80, 95), cost: randomBetween(12, 18) },
    { name: 'vm-web-prod-02', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-production', region: 'East US', cpu: randomBetween(70, 88), mem: randomBetween(75, 90), cost: randomBetween(12, 18) },
    { name: 'vm-api-prod-01', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-production', region: 'West US 2', cpu: randomBetween(65, 85), mem: randomBetween(60, 80), cost: randomBetween(14, 20) },
    { name: 'vm-db-prod-01', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-databases', region: 'East US', cpu: randomBetween(40, 60), mem: randomBetween(70, 90), cost: randomBetween(18, 25) },
    { name: 'vm-dev-01', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-development', region: 'West Europe', cpu: randomBetween(2, 8), mem: randomBetween(5, 15), cost: randomBetween(5, 8) },
    { name: 'vm-dev-02', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-development', region: 'West Europe', cpu: randomBetween(1, 5), mem: randomBetween(3, 10), cost: randomBetween(5, 8) },
    { name: 'vm-staging-01', type: 'Microsoft.Compute/virtualMachines', rg: 'rg-staging', region: 'North Europe', cpu: randomBetween(3, 12), mem: randomBetween(8, 20), cost: randomBetween(7, 12) },
    { name: 'sql-prod-server', type: 'Microsoft.Sql/servers', rg: 'rg-databases', region: 'East US', cpu: randomBetween(55, 75), mem: randomBetween(60, 80), cost: randomBetween(22, 30) },
    { name: 'sql-analytics-db', type: 'Microsoft.Sql/servers', rg: 'rg-analytics', region: 'West US 2', cpu: randomBetween(45, 65), mem: randomBetween(50, 70), cost: randomBetween(18, 26) },
    { name: 'storage-prod-blob', type: 'Microsoft.Storage/storageAccounts', rg: 'rg-production', region: 'East US', cpu: null, mem: null, cost: randomBetween(8, 14) },
    { name: 'storage-backup', type: 'Microsoft.Storage/storageAccounts', rg: 'rg-production', region: 'East US', cpu: null, mem: null, cost: randomBetween(6, 10) },
    { name: 'aks-prod-cluster', type: 'Microsoft.ContainerService/managedClusters', rg: 'rg-production', region: 'East US', cpu: randomBetween(55, 75), mem: randomBetween(60, 80), cost: randomBetween(30, 45) },
    { name: 'cosmos-prod-db', type: 'Microsoft.DocumentDB/databaseAccounts', rg: 'rg-databases', region: 'East US', cpu: randomBetween(30, 50), mem: null, cost: randomBetween(15, 22) },
    { name: 'redis-prod-cache', type: 'Microsoft.Cache/Redis', rg: 'rg-production', region: 'East US', cpu: randomBetween(20, 40), mem: randomBetween(45, 65), cost: randomBetween(8, 14) },
    { name: 'appservice-api-prod', type: 'Microsoft.Web/sites', rg: 'rg-production', region: 'West US 2', cpu: randomBetween(40, 65), mem: randomBetween(50, 75), cost: randomBetween(10, 16) }
  ];

  return resources.map((r, idx) => ({
    resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${r.rg}/providers/${r.type}/${r.name}`,
    name: r.name,
    type: r.type,
    resource_group: r.rg,
    region: r.region,
    subscription_id: SUBSCRIPTION_ID,
    status: r.cpu !== null && r.cpu < 5 ? 'idle' : 'running',
    cpu_utilization: r.cpu !== null ? parseFloat(r.cpu.toFixed(1)) : null,
    memory_utilization: r.mem !== null ? parseFloat(r.mem.toFixed(1)) : null,
    cost_per_day: parseFloat(r.cost.toFixed(2)),
    tags: { environment: r.rg.includes('prod') ? 'production' : r.rg.includes('dev') ? 'development' : 'staging' }
  }));
}

function generateCostByService() {
  return [
    { service: 'Virtual Machines', cost: parseFloat(randomBetween(28000, 35000).toFixed(2)), percentage: 0 },
    { service: 'Azure Kubernetes Service', cost: parseFloat(randomBetween(12000, 16000).toFixed(2)), percentage: 0 },
    { service: 'Azure SQL Database', cost: parseFloat(randomBetween(10000, 14000).toFixed(2)), percentage: 0 },
    { service: 'Azure Storage', cost: parseFloat(randomBetween(7000, 10000).toFixed(2)), percentage: 0 },
    { service: 'Azure Cosmos DB', cost: parseFloat(randomBetween(5000, 8000).toFixed(2)), percentage: 0 },
    { service: 'Azure App Service', cost: parseFloat(randomBetween(3500, 5500).toFixed(2)), percentage: 0 },
    { service: 'Azure CDN', cost: parseFloat(randomBetween(2000, 3500).toFixed(2)), percentage: 0 },
    { service: 'Azure Functions', cost: parseFloat(randomBetween(1000, 2000).toFixed(2)), percentage: 0 },
    { service: 'Azure Monitor', cost: parseFloat(randomBetween(800, 1500).toFixed(2)), percentage: 0 },
    { service: 'Other Services', cost: parseFloat(randomBetween(1500, 2500).toFixed(2)), percentage: 0 }
  ].map(item => item).reduce((acc, item, _, arr) => {
    const total = arr.reduce((s, i) => s + i.cost, 0);
    acc.push({ ...item, percentage: parseFloat(((item.cost / total) * 100).toFixed(1)) });
    return acc;
  }, []);
}

function generateCostByRegion() {
  return [
    { region: 'East US', cost: parseFloat(randomBetween(32000, 42000).toFixed(2)) },
    { region: 'West US 2', cost: parseFloat(randomBetween(14000, 20000).toFixed(2)) },
    { region: 'West Europe', cost: parseFloat(randomBetween(10000, 15000).toFixed(2)) },
    { region: 'North Europe', cost: parseFloat(randomBetween(6000, 10000).toFixed(2)) },
    { region: 'Southeast Asia', cost: parseFloat(randomBetween(3000, 6000).toFixed(2)) },
    { region: 'UK South', cost: parseFloat(randomBetween(2000, 4000).toFixed(2)) },
    { region: 'Australia East', cost: parseFloat(randomBetween(1500, 3000).toFixed(2)) },
    { region: 'Canada Central', cost: parseFloat(randomBetween(1000, 2500).toFixed(2)) }
  ];
}

function generateCostByResourceGroup() {
  return [
    { resource_group: 'rg-production', cost: parseFloat(randomBetween(38000, 48000).toFixed(2)) },
    { resource_group: 'rg-databases', cost: parseFloat(randomBetween(15000, 22000).toFixed(2)) },
    { resource_group: 'rg-analytics', cost: parseFloat(randomBetween(10000, 15000).toFixed(2)) },
    { resource_group: 'rg-staging', cost: parseFloat(randomBetween(6000, 10000).toFixed(2)) },
    { resource_group: 'rg-networking', cost: parseFloat(randomBetween(4000, 7000).toFixed(2)) },
    { resource_group: 'rg-development', cost: parseFloat(randomBetween(3000, 5000).toFixed(2)) },
    { resource_group: 'rg-security', cost: parseFloat(randomBetween(2000, 4000).toFixed(2)) },
    { resource_group: 'rg-monitoring', cost: parseFloat(randomBetween(1500, 3000).toFixed(2)) }
  ];
}

function generateTopExpensiveResources() {
  return [
    { name: 'aks-prod-cluster', type: 'AKS Cluster', resource_group: 'rg-production', region: 'East US', monthly_cost: parseFloat(randomBetween(1100, 1400).toFixed(2)), daily_cost: parseFloat(randomBetween(36, 46).toFixed(2)) },
    { name: 'sql-prod-server', type: 'SQL Server', resource_group: 'rg-databases', region: 'East US', monthly_cost: parseFloat(randomBetween(750, 950).toFixed(2)), daily_cost: parseFloat(randomBetween(25, 32).toFixed(2)) },
    { name: 'vm-db-prod-01', type: 'Virtual Machine', resource_group: 'rg-databases', region: 'East US', monthly_cost: parseFloat(randomBetween(600, 800).toFixed(2)), daily_cost: parseFloat(randomBetween(20, 27).toFixed(2)) },
    { name: 'vm-api-prod-01', type: 'Virtual Machine', resource_group: 'rg-production', region: 'West US 2', monthly_cost: parseFloat(randomBetween(500, 650).toFixed(2)), daily_cost: parseFloat(randomBetween(17, 22).toFixed(2)) },
    { name: 'cosmos-prod-db', type: 'Cosmos DB', resource_group: 'rg-databases', region: 'East US', monthly_cost: parseFloat(randomBetween(450, 600).toFixed(2)), daily_cost: parseFloat(randomBetween(15, 20).toFixed(2)) },
    { name: 'vm-web-prod-01', type: 'Virtual Machine', resource_group: 'rg-production', region: 'East US', monthly_cost: parseFloat(randomBetween(400, 550).toFixed(2)), daily_cost: parseFloat(randomBetween(13, 18).toFixed(2)) },
    { name: 'sql-analytics-db', type: 'SQL Database', resource_group: 'rg-analytics', region: 'West US 2', monthly_cost: parseFloat(randomBetween(380, 520).toFixed(2)), daily_cost: parseFloat(randomBetween(13, 17).toFixed(2)) },
    { name: 'appservice-api-prod', type: 'App Service', resource_group: 'rg-production', region: 'West US 2', monthly_cost: parseFloat(randomBetween(350, 480).toFixed(2)), daily_cost: parseFloat(randomBetween(12, 16).toFixed(2)) },
    { name: 'vm-web-prod-02', type: 'Virtual Machine', resource_group: 'rg-production', region: 'East US', monthly_cost: parseFloat(randomBetween(320, 450).toFixed(2)), daily_cost: parseFloat(randomBetween(11, 15).toFixed(2)) },
    { name: 'redis-prod-cache', type: 'Redis Cache', resource_group: 'rg-production', region: 'East US', monthly_cost: parseFloat(randomBetween(280, 400).toFixed(2)), daily_cost: parseFloat(randomBetween(9, 13).toFixed(2)) }
  ];
}

function detectAnomalies(costData) {
  if (!costData || costData.length === 0) return [];

  const amounts = costData.map(d => d.amount || d.total || 0);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  return costData.filter((d, idx) => {
    const amount = amounts[idx];
    const zScore = stdDev > 0 ? Math.abs((amount - mean) / stdDev) : 0;
    return zScore > 2;
  }).map(d => ({
    ...d,
    anomaly: true,
    deviation: stdDev > 0 ? parseFloat(((((d.amount || d.total || 0) - mean) / mean) * 100).toFixed(1)) : 0
  }));
}

function generateRecommendations() {
  return [
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-development/providers/Microsoft.Compute/virtualMachines/vm-dev-01`,
      title: 'Resize underutilized VM: vm-dev-01',
      description: 'This VM has been running at less than 5% CPU utilization for the past 30 days. Consider downsizing from Standard_D4s_v3 to Standard_B2s to reduce costs significantly.',
      category: 'Resize VM',
      priority: 'high',
      estimated_savings: parseFloat(randomBetween(85, 110).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-development/providers/Microsoft.Compute/virtualMachines/vm-dev-02`,
      title: 'Stop idle VM: vm-dev-02',
      description: 'VM vm-dev-02 has shown no activity for 14 days. Stopping or deallocating this VM will stop the compute charges immediately.',
      category: 'Stop VM',
      priority: 'critical',
      estimated_savings: parseFloat(randomBetween(120, 160).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-production/providers/Microsoft.Storage/storageAccounts/storage-backup`,
      title: 'Optimize storage tier for storage-backup',
      description: 'Storage account storage-backup contains blobs not accessed in 90+ days. Moving to Cool or Archive tier can save significant costs.',
      category: 'Storage Optimization',
      priority: 'medium',
      estimated_savings: parseFloat(randomBetween(45, 75).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-databases/providers/Microsoft.Sql/servers/sql-prod-server`,
      title: 'Enable Azure Hybrid Benefit on sql-prod-server',
      description: 'You have existing SQL Server licenses with Software Assurance. Enabling Azure Hybrid Benefit could reduce SQL Database costs by up to 40%.',
      category: 'License Optimization',
      priority: 'high',
      estimated_savings: parseFloat(randomBetween(280, 380).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-production/providers/Microsoft.ContainerService/managedClusters/aks-prod-cluster`,
      title: 'Enable AKS cluster autoscaling',
      description: 'The AKS cluster aks-prod-cluster is running with fixed node count. Enabling cluster autoscaler can reduce costs during off-peak hours.',
      category: 'Scaling Optimization',
      priority: 'medium',
      estimated_savings: parseFloat(randomBetween(180, 250).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-staging/providers/Microsoft.Compute/virtualMachines/vm-staging-01`,
      title: 'Schedule auto-shutdown for vm-staging-01',
      description: 'Staging VM vm-staging-01 runs 24/7 but is only used during business hours. Scheduling auto-shutdown for nights and weekends can save over 60% of its cost.',
      category: 'Schedule Optimization',
      priority: 'high',
      estimated_savings: parseFloat(randomBetween(90, 140).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-analytics/providers/Microsoft.Sql/servers/sql-analytics-db`,
      title: 'Use Reserved Instances for sql-analytics-db',
      description: 'SQL Database sql-analytics-db has been running continuously for 6+ months. Purchasing a 1-year reserved instance can save up to 33% compared to pay-as-you-go pricing.',
      category: 'Reserved Instances',
      priority: 'medium',
      estimated_savings: parseFloat(randomBetween(150, 210).toFixed(2)),
      status: 'active'
    },
    {
      resource_id: `/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/rg-production/providers/Microsoft.Cache/Redis/redis-prod-cache`,
      title: 'Downsize Redis cache tier',
      description: 'Redis cache redis-prod-cache is using only 35% of its allocated memory. Consider downgrading to a smaller cache size (C1 to C0) to reduce monthly costs.',
      category: 'Resize Resource',
      priority: 'low',
      estimated_savings: parseFloat(randomBetween(60, 90).toFixed(2)),
      status: 'active'
    }
  ];
}

module.exports = {
  generateMonthlyCosts,
  generateResources,
  generateCostByService,
  generateCostByRegion,
  generateCostByResourceGroup,
  generateTopExpensiveResources,
  detectAnomalies,
  generateRecommendations,
  AZURE_SERVICES,
  AZURE_REGIONS,
  RESOURCE_GROUPS,
  SUBSCRIPTION_ID
};
