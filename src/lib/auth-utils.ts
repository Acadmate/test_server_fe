// lib/auth-utils.ts
import { getCookie, setCookie, deleteCookie } from "./cookies";

// Token management
const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "token_expiry";

/**
 * Store authentication token with expiry
 */
export function setAuthToken(
  token: string,
  expiresIn: number = 7 * 24 * 60 * 60 * 1000
) {
  const expiryTime = Date.now() + expiresIn;
  setCookie(TOKEN_KEY, token, expiresIn / (24 * 60 * 60 * 1000)); // Convert to days
  setCookie(
    TOKEN_EXPIRY_KEY,
    expiryTime.toString(),
    expiresIn / (24 * 60 * 60 * 1000)
  );
}

/**
 * Get authentication token if it's still valid
 */
export function getAuthToken(): string | null {
  const token = getCookie(TOKEN_KEY);
  const expiryStr = getCookie(TOKEN_EXPIRY_KEY);

  if (!token || !expiryStr) {
    return null;
  }

  const expiry = parseInt(expiryStr, 10);
  if (Date.now() > expiry) {
    // Token has expired
    clearAuthToken();
    return null;
  }

  return token;
}

/**
 * Clear authentication token
 */
export function clearAuthToken() {
  deleteCookie(TOKEN_KEY);
  deleteCookie(TOKEN_EXPIRY_KEY);
}

/**
 * Check if token is close to expiry (within 1 hour)
 */
export function isTokenCloseToExpiry(): boolean {
  const expiryStr = getCookie(TOKEN_EXPIRY_KEY);

  if (!expiryStr) {
    return true;
  }

  const expiry = parseInt(expiryStr, 10);
  const oneHour = 60 * 60 * 1000;

  return expiry - Date.now() < oneHour;
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): number | null {
  const expiryStr = getCookie(TOKEN_EXPIRY_KEY);

  if (!expiryStr) {
    return null;
  }

  return parseInt(expiryStr, 10);
}

/**
 * Check if user has valid authentication
 */
export function hasValidAuth(): boolean {
  return getAuthToken() !== null;
}

/**
 * Route validation utilities
 */
export const ROUTE_CONFIG = {
  PUBLIC_ROUTES: ["/", "/login", "/maintenance"],
  PROTECTED_ROUTES: [
    "/attendance",
    "/timetable",
    "/calender",
    "/supadocs",
    "/gpacalc",
    "/logs",
    "/messmenu",
    "/info",
  ],
  AUTH_REDIRECT: "/attendance",
  LOGIN_REDIRECT: "/login",
} as const;

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return ROUTE_CONFIG.PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
}

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return ROUTE_CONFIG.PUBLIC_ROUTES.some((route) => pathname === route);
}

/**
 * Get redirect URL based on authentication status
 */
export function getRedirectUrl(
  pathname: string,
  isAuthenticated: boolean
): string | null {
  if (isAuthenticated) {
    // Redirect authenticated users away from login
    if (pathname === ROUTE_CONFIG.LOGIN_REDIRECT) {
      return ROUTE_CONFIG.AUTH_REDIRECT;
    }
  } else {
    // Redirect unauthenticated users from protected routes
    if (isProtectedRoute(pathname)) {
      return ROUTE_CONFIG.LOGIN_REDIRECT;
    }
  }

  return null;
}
