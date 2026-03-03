import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const getCurrentUser = () => api.get('/auth/me');

// Customers
export const getCustomers = () => api.get('/customers/');

// Usage
export const getUsage = (params) => api.get('/usage', { params });
export const getUsageSummary = (params) => api.get('/usage/summary', { params });
export const getTopCustomers = (params) => api.get('/usage/top-customers', { params });
export const getAdminCharges = (params) => api.get('/billing/charges', { params });

// Forecasts
export const generateForecast = (data) => api.post('/forecasts/generate', data);
export const generateSystemForecast = (data) => api.post('/forecasts/generate-system', data);
export const getForecasts = (params) => api.get('/forecasts', { params });

// Bills
export const getBills = (params) => api.get('/billing/bills', { params });
export const getBill = (id) => api.get(`/billing/bills/${id}`);

// Alerts
export const getAlerts = (params) => api.get('/alerts', { params });
export const acknowledgeAlert = (id) => api.post(`/alerts/${id}/acknowledge`);

// Meter Reading
export const uploadMeterPhoto = (formData) => api.post('/meter/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMeterReadings = (params) => api.get('/meter/readings', { params });

// Admin
export const getUsers = () => api.get('/admin/users');
export const approveUser = (id) => api.post(`/admin/users/${id}/approve`);
export const createUser = (data) => api.post('/admin/users', data);
export const importData = (formData) => api.post('/admin/import/usage', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});


// Zip Rates
export const getZipRates = (params) => api.get('/billing/zip-rates', { params });
export const createZipRate = (data) => api.post('/billing/zip-rates', data);
export const updateZipRate = (id, data) => api.put(`/billing/zip-rates/${id}`, data);
export const deleteZipRate = (id) => api.delete(`/billing/zip-rates/${id}`);
export const setCustomerRate = (data) => api.post('/billing/customer-rate', data);

export default api;