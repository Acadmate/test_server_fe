import axios from 'axios';
import { deleteCookie, setCookie, getCookie } from './cookies';

// Create axios instance with default config
const apiClient = axios.create({
  withCredentials: true,
});

// Function to set up axios interceptors for Bearer token
export const setupAuthInterceptor = () => {
  // Request interceptor to add Bearer token
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken') || getCookie('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token expiry
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        clearAuthData();
        
        // Redirect to login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Function to initialize auth on app startup
export const initializeAuth = () => {
  const token = localStorage.getItem('authToken') || getCookie('token');
  if (token) {
    // Ensure token is in both localStorage and cookie
    if (!localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', token);
    }
    if (!getCookie('token')) {
      setCookie('token', token, 7);
    }
    
    // Set default authorization header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // Setup interceptors
    setupAuthInterceptor();
  }
};

// Function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('authMessage');
  localStorage.removeItem('stats');
  localStorage.removeItem('user');
  deleteCookie('token');
  delete axios.defaults.headers.common['Authorization'];
};

export { apiClient }; 