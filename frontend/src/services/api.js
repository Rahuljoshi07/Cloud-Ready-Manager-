import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile')
};

// Costs
export const costsAPI = {
  getSummary: () => api.get('/costs/summary'),
  getMonthlyCost: () => api.get('/costs/monthly'),
  getDailyCosts: () => api.get('/costs/daily'),
  getCostByService: () => api.get('/costs/by-service'),
  getCostByRegion: () => api.get('/costs/by-region'),
  getCostByResourceGroup: () => api.get('/costs/by-resource-group'),
  getTopResources: () => api.get('/costs/top-resources'),
  getForecast: (days = 30) => api.get(`/costs/forecast?days=${days}`)
};

// Budgets
export const budgetsAPI = {
  getAll: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`)
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`)
};

// Recommendations
export const recommendationsAPI = {
  getAll: (params) => api.get('/recommendations', { params }),
  updateStatus: (id, status) => api.put(`/recommendations/${id}`, { status })
};

export default api;
