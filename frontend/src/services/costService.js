import api from './api';

export const costService = {
  async getDashboardSummary() {
    const response = await api.get('/api/costs/dashboard/summary');
    return response.data;
  },

  async getCostTrend(days = 30) {
    const response = await api.get(`/api/costs/trend?days=${days}`);
    return response.data;
  },

  async getCostByService(subscriptionId) {
    const params = subscriptionId ? { subscriptionId } : {};
    const response = await api.get('/api/costs/by-service', { params });
    return response.data;
  },

  async getCostByRegion(subscriptionId) {
    const params = subscriptionId ? { subscriptionId } : {};
    const response = await api.get('/api/costs/by-region', { params });
    return response.data;
  },

  async getResources(filters = {}) {
    const response = await api.get('/api/resources', { params: filters });
    return response.data;
  },

  async getRecommendations() {
    const response = await api.get('/api/recommendations');
    return response.data;
  },

  async applyRecommendation(id) {
    const response = await api.post(`/api/recommendations/${id}/apply`);
    return response.data;
  },

  async dismissRecommendation(id) {
    const response = await api.post(`/api/recommendations/${id}/dismiss`);
    return response.data;
  },

  async getBudgets() {
    const response = await api.get('/api/budgets');
    return response.data;
  },

  async createBudget(data) {
    const response = await api.post('/api/budgets', data);
    return response.data;
  },

  async updateBudget(id, data) {
    const response = await api.put(`/api/budgets/${id}`, data);
    return response.data;
  },

  async deleteBudget(id) {
    const response = await api.delete(`/api/budgets/${id}`);
    return response.data;
  },

  async getAlerts() {
    const response = await api.get('/api/alerts');
    return response.data;
  },

  async acknowledgeAlert(id) {
    const response = await api.put(`/api/alerts/${id}/acknowledge`);
    return response.data;
  },

  async resolveAlert(id) {
    const response = await api.put(`/api/alerts/${id}/resolve`);
    return response.data;
  },

  async getReports() {
    const response = await api.get('/api/reports');
    return response.data;
  },

  async generateReport(type) {
    const response = await api.post('/api/reports/generate', { type });
    return response.data;
  },

  async getSubscriptions() {
    const response = await api.get('/api/subscriptions');
    return response.data;
  },
};

export default costService;
