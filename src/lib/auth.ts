import { getCookie, setCookie, deleteCookie } from './cookies';
import { apiClient } from './api';

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}

export interface RefreshResponse {
  success: boolean;
  token?: string;
  message?: string;
}

/**
 * Attempts to refresh the authentication token
 * @returns Promise<boolean> - true if refresh successful, false otherwise
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }

    const api_url = process.env.NEXT_PUBLIC_API_URL;
    const response = await apiClient.post(`${api_url}/refresh`, {
      refreshToken
    }, {
      withCredentials: true
    });

    const data: RefreshResponse = response.data;
    
    if (data.success && data.token) {
      // Update the token
      setCookie('token', data.token, 7);
      
      // Update axios headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      console.log('Token refreshed successfully');
      return true;
    } else {
      console.log('Token refresh failed:', data.message);
      return false;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

/**
 * Checks if the current token is expired or invalid
 * @returns Promise<boolean> - true if token is valid, false if expired/invalid
 */
export async function isTokenValid(): Promise<boolean> {
  try {
    const token = getCookie('token');
    if (!token) {
      return false;
    }

    // Make a simple API call to test token validity
    const api_url = process.env.NEXT_PUBLIC_API_URL;
    await apiClient.get(`${api_url}/validate-token`, {
      withCredentials: true
    });
    
    return true;
  } catch (error: any) {
    if (error.response?.data?.message === 'Session expired - please login again') {
      return false;
    }
    // For other errors, assume token is valid (network issues, etc.)
    return true;
  }
}

/**
 * Handles authentication errors and attempts token refresh
 * @param error - The error response from the API
 * @returns Promise<boolean> - true if authentication issue resolved, false if login required
 */
export async function handleAuthError(error: any): Promise<boolean> {
  // Check if it's a session expired error
  if (error.response?.data?.message === 'Session expired - please login again') {
    console.log('Session expired, attempting token refresh...');
    
    // Try to refresh the token
    const refreshSuccess = await refreshAuthToken();
    
    if (refreshSuccess) {
      console.log('Token refreshed, retrying original request...');
      return true; // Token refreshed, can retry request
    } else {
      console.log('Token refresh failed, redirecting to login...');
      // Clear auth data and redirect to login
      clearAuthData();
      return false; // Login required
    }
  }
  
  // For other authentication errors (401, 403), redirect to login
  if (error.response?.status === 401 || error.response?.status === 403) {
    console.log('Authentication error, redirecting to login...');
    clearAuthData();
    return false; // Login required
  }
  
  // For other errors, don't handle authentication
  return true;
}

/**
 * Clears all authentication data
 */
export function clearAuthData(): void {
  deleteCookie('token');
  deleteCookie('refreshToken');
  delete apiClient.defaults.headers.common['Authorization'];
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Gets the current authentication state
 * @returns Object with token and isAuthenticated status
 */
export function getAuthState(): { token: string | null; isAuthenticated: boolean } {
  const token = getCookie('token');
  return {
    token,
    isAuthenticated: !!token
  };
} 