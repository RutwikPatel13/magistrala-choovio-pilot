import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const magistralaAPI = {
  // Health check
  getHealth: () => api.get('/health'),
  
  // Devices
  getDevices: (params = {}) => api.get('/clients', { params }),
  getDevice: (id) => api.get(`/clients/${id}`),
  createDevice: (data) => api.post('/clients', data),
  updateDevice: (id, data) => api.put(`/clients/${id}`, data),
  deleteDevice: (id) => api.delete(`/clients/${id}`),
  
  // Channels
  getChannels: (params = {}) => api.get('/channels', { params }),
  getChannel: (id) => api.get(`/channels/${id}`),
  createChannel: (data) => api.post('/channels', data),
  updateChannel: (id, data) => api.put(`/channels/${id}`, data),
  deleteChannel: (id) => api.delete(`/channels/${id}`),
  
  // Messages
  getMessages: (channelId, params = {}) => api.get(`/channels/${channelId}/messages`, { params }),
  sendMessage: (channelId, data) => api.post(`/http/channels/${channelId}/messages`, data),
  
  // Analytics
  getAnalytics: (params = {}) => api.get('/analytics', { params }),
  getDeviceStats: (deviceId, params = {}) => api.get(`/analytics/devices/${deviceId}`, { params }),
  
  // Authentication
  login: (credentials) => api.post('/users/tokens/issue', credentials),
  register: (userData) => api.post('/users', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export default api;