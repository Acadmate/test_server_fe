// components/auth/SessionManager.tsx
"use client";
import { useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { isTokenCloseToExpiry, getTokenExpiry } from "@/lib/auth-utils";

interface SessionManagerProps {
  children: React.ReactNode;
  warningTime?: number; // Minutes before expiry to show warning
  autoRefresh?: boolean; // Whether to auto-refresh token
}

export default function SessionManager({
  children,
  warningTime = 5,
  autoRefresh = true,
}: SessionManagerProps) {
  const { isAuthenticated, checkAuth, logout } = useAuthStore();
  const warningShown = useRef(false);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);
  const warningTimer = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }
  }, []);

  // Show session expiry warning
  const showExpiryWarning = useCallback(() => {
    if (warningShown.current) return;

    warningShown.current = true;

    const shouldExtend = window.confirm(
      `Your session will expire in ${warningTime} minutes. Would you like to extend your session?`
    );

    if (shouldExtend) {
      checkAuth(); // Refresh the session
    } else {
      logout(); // User chose to logout
    }

    warningShown.current = false;
  }, [warningTime, checkAuth, logout]);

  // Setup session timers
  const setupTimers = useCallback(() => {
    if (!isAuthenticated) return;

    clearTimers();

    const expiry = getTokenExpiry();
    if (!expiry) return;

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const warningTimeMs = warningTime * 60 * 1000;

    // Set warning timer
    if (timeUntilExpiry > warningTimeMs) {
      warningTimer.current = setTimeout(() => {
        showExpiryWarning();
      }, timeUntilExpiry - warningTimeMs);
    }

    // Set auto-refresh timer (refresh 2 minutes before expiry)
    if (autoRefresh && timeUntilExpiry > 2 * 60 * 1000) {
      refreshTimer.current = setTimeout(() => {
        checkAuth();
      }, timeUntilExpiry - 2 * 60 * 1000);
    }
  }, [
    isAuthenticated,
    warningTime,
    autoRefresh,
    clearTimers,
    showExpiryWarning,
    checkAuth,
  ]);

  // Check for token expiry periodically
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      return;
    }

    setupTimers();

    // Check every minute for token expiry
    const interval = setInterval(() => {
      if (isTokenCloseToExpiry()) {
        if (autoRefresh) {
          checkAuth();
        } else {
          showExpiryWarning();
        }
      }
    }, 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimers();
    };
  }, [
    isAuthenticated,
    setupTimers,
    clearTimers,
    autoRefresh,
    checkAuth,
    showExpiryWarning,
  ]);

  // Handle page visibility change (refresh token when user returns)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // User returned to the tab, check if token needs refresh
        if (isTokenCloseToExpiry()) {
          checkAuth();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isAuthenticated, checkAuth]);

  // Handle browser beforeunload (warn about unsaved changes)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAuthenticated && isTokenCloseToExpiry()) {
        e.preventDefault();
        e.returnValue =
          "Your session is about to expire. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
