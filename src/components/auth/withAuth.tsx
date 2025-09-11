// components/auth/withAuth.tsx
"use client";
import { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Higher-order component for protecting pages with authentication
 * @param WrappedComponent - The component to wrap
 * @param options - Configuration options
 */
export function withAuth<T extends object>(
  WrappedComponent: ComponentType<T>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = "/login", requireAuth = true } = options;

  return function AuthenticatedComponent(props: T) {
    const router = useRouter();
    const { isAuthenticated, isCheckingAuth } = useAuthStore();

    useEffect(() => {
      if (!isCheckingAuth && requireAuth && !isAuthenticated) {
        router.replace(redirectTo);
      }
    }, [isAuthenticated, isCheckingAuth, router]);

    // Show loading while checking auth
    if (isCheckingAuth) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9cc95e]"></div>
        </div>
      );
    }

    // Don't render component if auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

/**
 * Hook for checking authentication status in components
 */
export function useAuth() {
  const authStore = useAuthStore();

  return {
    ...authStore,
    isLoggedIn: authStore.isAuthenticated && !authStore.isCheckingAuth,
    isLoading: authStore.isCheckingAuth || authStore.isLoading,
  };
}

/**
 * Hook for getting current user information
 */
export function useUser() {
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  return {
    user,
    isLoggedIn: isAuthenticated && !isCheckingAuth,
    isLoading: isCheckingAuth,
  };
}
