/**
 * Mock Azure Service - Generates realistic Azure cost data
 * In production, replace with real Azure Cost Management API calls
 */

const SERVICES = ['Compute', 'Storage', 'Networking', 'Database', 'App Service', 'Kubernetes', 'Functions', 'CDN', 'Monitor', 'Security Center'];
const REGIONS = ['East US', 'West US 2', 'North Europe', 'West Europe', 'Southeast Asia', 'Australia East'];
const RESOURCE_GROUPS = ['prod-rg', 'staging-rg', 'dev-rg', 'data-rg', 'network-rg', 'security-rg'];
const SUBSCRIPTIONS = [
  { id: 'sub-prod-001', name: 'Production' },
  { id: 'sub-dev-002', name: 'Development' },
  { id: 'sub-staging-003', name: 'Staging' },
];

const SERVICE_BASE_COSTS = {
  Compute: 4200,
  Storage: 850,
  Networking: 620,
  Database: 1800,
  'App Service': 950,
  Kubernetes: 2100,
  Functions: 180,
  CDN: 240,
  Monitor: 320,
  'Security Center': 410,
};

function gaussianRandom(mean, std) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Generate daily cost data for the last N days
 */
function generateDailyCosts(days = 30) {
  const records = [];
  const today = new Date();

  for (let d = days; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];

    // Weekend discount simulation
    const isWeekend = [0, 6].includes(date.getDay());
    const weekendFactor = isWeekend ? 0.6 : 1.0;

    // Trend: slight upward over time
    const trendFactor = 1 + (days - d) * 0.002;

    for (const service of SERVICES) {
      for (const sub of SUBSCRIPTIONS) {
        const baseCost = SERVICE_BASE_COSTS[service] / 30;
        const noise = gaussianRandom(1, 0.12);
        const cost = Math.max(0, baseCost * noise * weekendFactor * trendFactor);

        records.push({
          subscription_id: sub.id,
          resource_group: RESOURCE_GROUPS[Math.floor(Math.random() * RESOURCE_GROUPS.length)],
          service_name: service,
          region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
          cost: parseFloat(cost.toFixed(2)),
          currency: 'USD',
          usage_date: dateStr,
          tags: { environment: sub.name.toLowerCase(), team: 'platform' },
        });
      }
    }
  }

  return records;
}

/**
 * Generate mock Azure resources
 */
function generateResources() {
  const resources = [];
  const statuses = ['running', 'running', 'running', 'stopped', 'deallocated'];

  const resourceDefs = [
    { prefix: 'vm', type: 'Microsoft.Compute/virtualMachines', baseCost: 200, count: 12 },
    { prefix: 'storage', type: 'Microsoft.Storage/storageAccounts', baseCost: 45, count: 8 },
    { prefix: 'sql', type: 'Microsoft.Sql/servers', baseCost: 380, count: 4 },
    { prefix: 'aks', type: 'Microsoft.ContainerService/managedClusters', baseCost: 520, count: 3 },
    { prefix: 'app', type: 'Microsoft.Web/sites', baseCost: 95, count: 6 },
    { prefix: 'cosmos', type: 'Microsoft.DocumentDB/databaseAccounts', baseCost: 290, count: 2 },
    { prefix: 'func', type: 'Microsoft.Web/sites/functions', baseCost: 18, count: 5 },
    { prefix: 'vnet', type: 'Microsoft.Network/virtualNetworks', baseCost: 12, count: 4 },
    { prefix: 'lb', type: 'Microsoft.Network/loadBalancers', baseCost: 35, count: 3 },
    { prefix: 'redis', type: 'Microsoft.Cache/Redis', baseCost: 160, count: 2 },
  ];

  let idx = 1;
  for (const def of resourceDefs) {
    for (let i = 1; i <= def.count; i++) {
      const sub = SUBSCRIPTIONS[Math.floor(Math.random() * SUBSCRIPTIONS.length)];
      const rg = RESOURCE_GROUPS[Math.floor(Math.random() * RESOURCE_GROUPS.length)];
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const cpuUtil = status === 'running' ? parseFloat(randomBetween(2, 92).toFixed(1)) : 0;
      const memUtil = status === 'running' ? parseFloat(randomBetween(15, 88).toFixed(1)) : 0;
      const monthlyCost = parseFloat((def.baseCost * randomBetween(0.7, 1.4)).toFixed(2));

      resources.push({
        resource_id: `/subscriptions/${sub.id}/resourceGroups/${rg}/providers/${def.type}/${def.prefix}-${String(i).padStart(2,'0')}`,
        name: `${def.prefix}-${String(i).padStart(2,'0')}`,
        type: def.type,
        resource_group: rg,
        subscription_id: sub.id,
        region,
        status,
        cpu_utilization: cpuUtil,
        memory_utilization: memUtil,
        monthly_cost: monthlyCost,
        tags: { environment: sub.name.toLowerCase(), index: idx++ },
      });
    }
  }

  return resources;
}

/**
 * Generate cost anomaly alerts based on z-score spikes
 */
function generateAlerts() {
  return [
    {
      type: 'cost_spike',
      severity: 'critical',
      message: 'Compute costs spiked 245% above baseline in East US - unexpected VM scaling event detected',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/vm-01',
      subscription_id: 'sub-prod-001',
    },
    {
      type: 'budget_exceeded',
      severity: 'high',
      message: 'Production subscription has exceeded 95% of monthly budget ($12,500 of $13,000 used)',
      resource_id: null,
      subscription_id: 'sub-prod-001',
    },
    {
      type: 'idle_resource',
      severity: 'medium',
      message: 'VM vm-07 has been running with <3% CPU utilization for 14 consecutive days, estimated waste: $180/month',
      resource_id: '/subscriptions/sub-dev-002/resourceGroups/dev-rg/providers/Microsoft.Compute/virtualMachines/vm-07',
      subscription_id: 'sub-dev-002',
    },
    {
      type: 'cost_spike',
      severity: 'high',
      message: 'Storage account egress costs increased by 180% - possible data exfiltration or misconfigured CDN',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/data-rg/providers/Microsoft.Storage/storageAccounts/storage-03',
      subscription_id: 'sub-prod-001',
    },
    {
      type: 'anomaly',
      severity: 'medium',
      message: 'Database DTU consumption anomaly detected on sql-02. Cost 3.1 standard deviations above 30-day mean.',
      resource_id: '/subscriptions/sub-staging-003/resourceGroups/staging-rg/providers/Microsoft.Sql/servers/sql-02',
      subscription_id: 'sub-staging-003',
    },
    {
      type: 'idle_resource',
      severity: 'low',
      message: 'Load balancer lb-03 has zero backend connections for 7 days. Consider removing to save $35/month.',
      resource_id: '/subscriptions/sub-dev-002/resourceGroups/dev-rg/providers/Microsoft.Network/loadBalancers/lb-03',
      subscription_id: 'sub-dev-002',
    },
  ];
}

/**
 * Generate optimization recommendations
 */
function generateRecommendations() {
  return [
    {
      type: 'rightsizing',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/prod-rg/providers/Microsoft.Compute/virtualMachines/vm-03',
      resource_name: 'vm-03',
      description: 'VM vm-03 is consistently running at <15% CPU and <20% memory. Downsize from Standard_D4s_v3 to Standard_B2s to reduce costs by 68%.',
      potential_savings: 312.50,
      action: 'Resize VM to Standard_B2s',
      status: 'pending',
    },
    {
      type: 'reserved_instances',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/prod-rg',
      resource_name: 'prod-rg VMs',
      description: 'Purchase 1-year Reserved Instances for 8 consistently running VMs. Pay-as-you-go to reserved pricing saves up to 40%.',
      potential_savings: 1840.00,
      action: 'Purchase Reserved Instances',
      status: 'pending',
    },
    {
      type: 'idle_resource',
      resource_id: '/subscriptions/sub-dev-002/resourceGroups/dev-rg/providers/Microsoft.Compute/virtualMachines/vm-08',
      resource_name: 'vm-08',
      description: 'VM vm-08 (dev environment) has been deallocated for 21 days. OS disk still incurring charges. Delete or snapshot for storage savings.',
      potential_savings: 45.00,
      action: 'Delete or snapshot stopped VM',
      status: 'pending',
    },
    {
      type: 'storage_optimization',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/data-rg/providers/Microsoft.Storage/storageAccounts/storage-01',
      resource_name: 'storage-01',
      description: '2.4 TB of blob data hasn\'t been accessed in 90+ days. Enable lifecycle management to move to Cool/Archive tier.',
      potential_savings: 285.00,
      action: 'Enable storage lifecycle policy',
      status: 'pending',
    },
    {
      type: 'auto_shutdown',
      resource_id: '/subscriptions/sub-dev-002/resourceGroups/dev-rg',
      resource_name: 'dev-rg',
      description: 'Dev/test VMs run 24/7 but only used 8 hours/day. Enable auto-shutdown schedules to reduce compute hours by 67%.',
      potential_savings: 520.00,
      action: 'Configure auto-shutdown policies',
      status: 'pending',
    },
    {
      type: 'spot_instances',
      resource_id: '/subscriptions/sub-staging-003/resourceGroups/staging-rg/providers/Microsoft.ContainerService/managedClusters/aks-01',
      resource_name: 'aks-01',
      description: 'AKS node pool uses on-demand instances for batch workloads. Switch to Spot node pool for 60-80% savings on fault-tolerant workloads.',
      potential_savings: 680.00,
      action: 'Add Spot node pool to AKS cluster',
      status: 'pending',
    },
    {
      type: 'database_optimization',
      resource_id: '/subscriptions/sub-prod-001/resourceGroups/data-rg/providers/Microsoft.Sql/servers/sql-01',
      resource_name: 'sql-01',
      description: 'Azure SQL database average DTU utilization is 22%. Consider elastic pool to share capacity with sql-02 and sql-03.',
      potential_savings: 420.00,
      action: 'Migrate to elastic pool',
      status: 'pending',
    },
    {
      type: 'unused_ip',
      resource_id: '/subscriptions/sub-dev-002/resourceGroups/network-rg',
      resource_name: 'network-rg IPs',
      description: '6 public IP addresses are allocated but not associated with any resource, costing $21.60/month.',
      potential_savings: 21.60,
      action: 'Delete unattached public IPs',
      status: 'pending',
    },
  ];
}

/**
 * Get subscriptions list
 */
function getSubscriptions() {
  return SUBSCRIPTIONS;
}

/**
 * Get cost summary for a subscription
 */
function getCostSummary(subscriptionId) {
  const sub = SUBSCRIPTIONS.find(s => s.id === subscriptionId) || SUBSCRIPTIONS[0];
  const totalMonthly = Object.values(SERVICE_BASE_COSTS).reduce((a, b) => a + b, 0);
  const dailyAvg = totalMonthly / 30;

  return {
    subscription_id: sub.id,
    subscription_name: sub.name,
    total_monthly_cost: totalMonthly,
    daily_average: parseFloat(dailyAvg.toFixed(2)),
    currency: 'USD',
    period: 'current_month',
    cost_by_service: Object.entries(SERVICE_BASE_COSTS).map(([name, cost]) => ({ service_name: name, total_cost: cost })),
  };
}

module.exports = {
  generateDailyCosts,
  generateResources,
  generateAlerts,
  generateRecommendations,
  getSubscriptions,
  getCostSummary,
  SUBSCRIPTIONS,
  SERVICES,
  REGIONS,
};
