import axios from "axios";
import { deleteCookie, getCookie } from "./cookies";
import { handleAuthError } from "./auth-interceptor";

// Create axios instance with default config
const apiClient = axios.create({
  withCredentials: true,
});

// Set up interceptors immediately when module loads
apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    console.log("API Request interceptor - Token found:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization header set for request to:", config.url);
    } else {
      console.log("No token found for request to:", config.url);
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    const authResolved = await handleAuthError(error);

    if (!authResolved) {
      // Authentication issue couldn't be resolved, redirect to login
      return Promise.reject(error);
    }

    // If auth was resolved (token refreshed), the original request can be retried
    // We'll let the calling function handle retrying
    return Promise.reject(error);
  }
);

export const setupAuthInterceptor = () => {
  // Interceptors are now set up automatically above
  // This function is kept for backward compatibility
  console.log("Auth interceptors already configured");
};

export const initializeAuth = () => {
  const token = getCookie("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setupAuthInterceptor();
  }
};

export const clearAuthData = () => {
  deleteCookie("token");
  delete axios.defaults.headers.common["Authorization"];
};

export { apiClient };
