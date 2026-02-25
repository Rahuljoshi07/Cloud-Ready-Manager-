const azureConfig = {
  subscriptionId: process.env.AZURE_SUBSCRIPTION_ID || '',
  tenantId: process.env.AZURE_TENANT_ID || '',
  clientId: process.env.AZURE_CLIENT_ID || '',
  clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  managementBaseUrl: 'https://management.azure.com',
  costManagementBaseUrl: 'https://management.azure.com/providers/Microsoft.CostManagement',
  tokenUrl: (tenantId) =>
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
};

module.exports = azureConfig;
