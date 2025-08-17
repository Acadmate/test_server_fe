import axios from 'axios';
import { deleteCookie, getCookie } from './cookies';

// Create axios instance with default config
const apiClient = axios.create({
  withCredentials: true,
});

export const setupAuthInterceptor = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const token = getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export const initializeAuth = () => {
  const token = getCookie('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setupAuthInterceptor();
  }
};

export const clearAuthData = () => {
  deleteCookie('token');
  delete axios.defaults.headers.common['Authorization'];
};

export { apiClient }; 