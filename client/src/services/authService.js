import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user');
    return response.data;
  },

  updateProfile: async (formData) => {
    const response = await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  googleLogin: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};

export default api;
