/**
 * Azure Service - Simulates Azure Cost Management API with realistic mock data.
 * When real Azure credentials are configured, replace mock functions with actual API calls.
 */

const { subDays, format, eachDayOfInterval, parseISO } = require('../utils/helpers');

const SUBSCRIPTIONS = [
  {
    id: 'sub-001-prod',
    name: 'Production Subscription',
    displayName: 'Contoso Production',
    state: 'Enabled',
  },
  {
    id: 'sub-002-dev',
    name: 'Development Subscription',
    displayName: 'Contoso Development',
    state: 'Enabled',
  },
  {
    id: 'sub-003-staging',
    name: 'Staging Subscription',
    displayName: 'Contoso Staging',
    state: 'Enabled',
  },
];

const SERVICES = [
  { name: 'Virtual Machines', baseDaily: 320, variance: 0.15 },
  { name: 'Azure SQL Database', baseDaily: 180, variance: 0.08 },
  { name: 'Azure Blob Storage', baseDaily: 45, variance: 0.2 },
  { name: 'App Service', baseDaily: 95, variance: 0.1 },
  { name: 'Azure Kubernetes Service', baseDaily: 210, variance: 0.12 },
  { name: 'Azure Functions', baseDaily: 12, variance: 0.3 },
  { name: 'Cosmos DB', baseDaily: 140, variance: 0.1 },
  { name: 'Azure Monitor', baseDaily: 28, variance: 0.15 },
  { name: 'Azure Active Directory', baseDaily: 18, variance: 0.05 },
  { name: 'Azure Key Vault', baseDaily: 5, variance: 0.1 },
  { name: 'Azure CDN', baseDaily: 22, variance: 0.25 },
  { name: 'Azure Load Balancer', baseDaily: 35, variance: 0.08 },
  { name: 'Azure VPN Gateway', baseDaily: 48, variance: 0.05 },
  { name: 'Azure Firewall', baseDaily: 72, variance: 0.06 },
  { name: 'Azure Backup', baseDaily: 30, variance: 0.12 },
];

const REGIONS = [
  { name: 'East US', weight: 0.35 },
  { name: 'West US 2', weight: 0.2 },
  { name: 'West Europe', weight: 0.18 },
  { name: 'Southeast Asia', weight: 0.12 },
  { name: 'Australia East', weight: 0.08 },
  { name: 'UK South', weight: 0.07 },
];

const RESOURCE_GROUPS = [
  'rg-production-core',
  'rg-production-data',
  'rg-production-network',
  'rg-dev-workloads',
  'rg-staging-env',
  'rg-shared-services',
  'rg-security',
  'rg-monitoring',
];

const RESOURCE_TYPES = [
  { type: 'Microsoft.Compute/virtualMachines', skus: ['Standard_D2s_v3', 'Standard_D4s_v3', 'Standard_B2ms', 'Standard_E4s_v3', 'Standard_F8s_v2'] },
  { type: 'Microsoft.Sql/servers/databases', skus: ['GP_Gen5_2', 'GP_Gen5_4', 'BC_Gen5_2', 'S2', 'S4'] },
  { type: 'Microsoft.Storage/storageAccounts', skus: ['Standard_LRS', 'Standard_GRS', 'Premium_LRS'] },
  { type: 'Microsoft.Web/sites', skus: ['B1', 'B2', 'S1', 'S2', 'P1v2', 'P2v2'] },
  { type: 'Microsoft.ContainerService/managedClusters', skus: ['Standard_DS2_v2', 'Standard_DS3_v2'] },
  { type: 'Microsoft.DocumentDB/databaseAccounts', skus: ['Serverless', 'Provisioned'] },
  { type: 'Microsoft.Cache/Redis', skus: ['C1', 'C2', 'P1'] },
  { type: 'Microsoft.Network/applicationGateways', skus: ['Standard_v2', 'WAF_v2'] },
];

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function jitter(base, variance, seed) {
  const rand = seed !== undefined ? seededRandom(seed) : Math.random();
  return base * (1 + variance * (rand * 2 - 1));
}

function weightedRegion(seed) {
  const rand = seed !== undefined ? seededRandom(seed) : Math.random();
  let cumulative = 0;
  for (const region of REGIONS) {
    cumulative += region.weight;
    if (rand <= cumulative) return region.name;
  }
  return REGIONS[0].name;
}

function getDatesBetween(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(format(new Date(d)));
  }
  return dates;
}

/**
 * Returns daily cost records for a subscription between two dates.
 */
function getCostData(subscriptionId, startDate, endDate) {
  const dates = getDatesBetween(startDate, endDate);
  const records = [];
  const subIndex = SUBSCRIPTIONS.findIndex((s) => s.id === subscriptionId);
  const multiplier = subIndex === 0 ? 1 : subIndex === 1 ? 0.35 : 0.55;

  dates.forEach((date, dayIndex) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.75 : 1;

    SERVICES.forEach((service, svcIndex) => {
      const seed = dayIndex * 100 + svcIndex;
      const base = service.baseDaily * multiplier * weekendFactor;
      const amount = parseFloat(jitter(base, service.variance, seed).toFixed(4));
      const rg = RESOURCE_GROUPS[svcIndex % RESOURCE_GROUPS.length];
      const region = weightedRegion(seed);

      records.push({
        subscriptionId,
        resourceGroup: rg,
        service: service.name,
        region,
        date,
        amount,
        currency: 'USD',
        usageQuantity: parseFloat((amount / (service.baseDaily * 0.05 + 1)).toFixed(2)),
        usageUnit: 'Hours',
        tags: { environment: subIndex === 0 ? 'production' : subIndex === 1 ? 'development' : 'staging', team: 'cloud-ops' },
      });
    });
  });

  return records;
}

/**
 * Returns a list of resources with utilization metrics.
 */
function getResources(subscriptionId) {
  const resources = [];
  const subIndex = SUBSCRIPTIONS.findIndex((s) => s.id === subscriptionId);
  const multiplier = subIndex === 0 ? 1 : subIndex === 1 ? 0.4 : 0.6;
  const resourceCount = subIndex === 0 ? 48 : subIndex === 1 ? 22 : 30;

  const vmNames = ['vm-web-prod', 'vm-api-prod', 'vm-db-prod', 'vm-cache-prod', 'vm-worker-01', 'vm-worker-02', 'vm-worker-03', 'vm-jumpbox', 'vm-bastion'];
  const sqlNames = ['sql-main-prod', 'sql-analytics', 'sql-reporting', 'sql-archive'];
  const storageNames = ['stprodblobs001', 'stprodlogs002', 'stbackups003', 'starchive004'];
  const appNames = ['app-frontend-prod', 'app-api-prod', 'app-admin-prod', 'app-workers'];
  const allNames = [...vmNames, ...sqlNames, ...storageNames, ...appNames];

  for (let i = 0; i < resourceCount; i++) {
    const typeObj = RESOURCE_TYPES[i % RESOURCE_TYPES.length];
    const seed = i + subIndex * 1000;
    const cpu = parseFloat((seededRandom(seed) * 85 + 5).toFixed(1));
    const mem = parseFloat((seededRandom(seed + 50) * 80 + 10).toFixed(1));
    const costPerDay = parseFloat((seededRandom(seed + 100) * 50 * multiplier + 2).toFixed(4));
    const isIdle = cpu < 10 && mem < 15;
    const name = allNames[i % allNames.length] + (i >= allNames.length ? `-${Math.floor(i / allNames.length)}` : '');
    const rg = RESOURCE_GROUPS[i % RESOURCE_GROUPS.length];

    resources.push({
      subscriptionId,
      resourceId: `/subscriptions/${subscriptionId}/resourceGroups/${rg}/providers/${typeObj.type}/${name}`,
      resourceName: name,
      resourceType: typeObj.type,
      resourceGroup: rg,
      region: weightedRegion(seed),
      status: isIdle ? 'stopped' : seededRandom(seed + 200) > 0.95 ? 'deallocated' : 'running',
      cpuUtilization: cpu,
      memoryUtilization: mem,
      costPerDay,
      sku: typeObj.skus[i % typeObj.skus.length],
      tags: {
        environment: subIndex === 0 ? 'production' : subIndex === 1 ? 'development' : 'staging',
        owner: ['alice@contoso.com', 'bob@contoso.com', 'carol@contoso.com'][i % 3],
        project: ['platform', 'data', 'frontend', 'backend'][i % 4],
      },
    });
  }

  return resources;
}

/**
 * Returns resource groups with aggregated costs.
 */
function getResourceGroups(subscriptionId) {
  const subIndex = SUBSCRIPTIONS.findIndex((s) => s.id === subscriptionId);
  const multiplier = subIndex === 0 ? 1 : subIndex === 1 ? 0.35 : 0.55;

  return RESOURCE_GROUPS.map((rg, i) => {
    const seed = i + subIndex * 100;
    const monthlyCost = parseFloat(jitter(3200 * multiplier, 0.3, seed).toFixed(2));
    return {
      name: rg,
      subscriptionId,
      monthlyCost,
      currency: 'USD',
      resourceCount: Math.floor(seededRandom(seed) * 15 + 2),
    };
  });
}

/**
 * Returns cost breakdown by service for a given period (days).
 */
function getCostByService(subscriptionId, period = 30) {
  const subIndex = SUBSCRIPTIONS.findIndex((s) => s.id === subscriptionId);
  const multiplier = subIndex === 0 ? 1 : subIndex === 1 ? 0.35 : 0.55;

  return SERVICES.map((service, i) => ({
    service: service.name,
    totalCost: parseFloat((service.baseDaily * multiplier * period).toFixed(2)),
    currency: 'USD',
    trend: parseFloat((seededRandom(i) * 20 - 5).toFixed(1)),
  })).sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Returns cost breakdown by region.
 */
function getCostByRegion(subscriptionId, period = 30) {
  const subIndex = SUBSCRIPTIONS.findIndex((s) => s.id === subscriptionId);
  const multiplier = subIndex === 0 ? 1 : subIndex === 1 ? 0.35 : 0.55;
  const totalDaily = SERVICES.reduce((sum, s) => sum + s.baseDaily, 0) * multiplier;

  return REGIONS.map((region, i) => ({
    region: region.name,
    totalCost: parseFloat((totalDaily * region.weight * period).toFixed(2)),
    currency: 'USD',
    percentage: parseFloat((region.weight * 100).toFixed(1)),
  })).sort((a, b) => b.totalCost - a.totalCost);
}

/**
 * Returns all available subscriptions.
 */
function getSubscriptions() {
  return SUBSCRIPTIONS;
}

module.exports = {
  getCostData,
  getResources,
  getResourceGroups,
  getCostByService,
  getCostByRegion,
  getSubscriptions,
};
