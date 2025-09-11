// components/auth/SimpleSessionManager.tsx
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

interface SimpleSessionManagerProps {
  children: React.ReactNode;
}

export default function SimpleSessionManager({
  children,
}: SimpleSessionManagerProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Periodic auth check (every 5 minutes) - only if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, checkAuth]);

  // Check auth on page focus - only if authenticated
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        checkAuth();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated, checkAuth]);

  // Check auth when page becomes visible - only if authenticated
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        checkAuth();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isAuthenticated, checkAuth]);

  return <>{children}</>;
}
