// auth-interceptor.ts - Handles auth errors without circular dependencies
import { deleteCookie } from "./cookies";

/**
 * Handle authentication errors from API responses
 * @param error - The error response from the API
 * @returns Promise<boolean> - true if error handled, false if login required
 */
export async function handleAuthError(error: unknown): Promise<boolean> {
  // Check if it's a session expired error
  const errorObj = error as {
    response?: {
      data?: { message?: string };
      status?: number;
    };
  };

  // For authentication errors (401, 403), clear auth and require login
  if (errorObj.response?.status === 401 || errorObj.response?.status === 403) {
    console.log("Authentication error detected, clearing auth data...");

    // Clear auth cookies
    deleteCookie("token");
    deleteCookie("refreshToken");

    // Redirect to login if we're not already there
    if (
      typeof window !== "undefined" &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/login";
    }

    return false; // Login required
  }

  // For other errors, don't handle authentication
  return true;
}
