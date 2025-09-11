// components/auth/AuthGuard.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import { AbstergoLoader } from "@/components/shared/LoadingComponents";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isClientMounted, setIsClientMounted] = useState(false);

  useEffect(() => {
    setIsClientMounted(true);
    checkAuth();
  }, [checkAuth]);

  // Handle routing based on auth state once check is complete and client is mounted
  useEffect(() => {
    if (!isClientMounted) return; // Wait for client mounting

    const publicRoutes = ["/login", "/maintenance"];
    const protectedRoutes = [
      "/attendance",
      "/timetable",
      "/calender",
      "/supadocs",
      "/gpacalc",
      "/logs",
      "/messmenu",
      "/info",
    ];

    const isPublicRoute = publicRoutes.includes(pathname);
    const isProtectedRoute = protectedRoutes.includes(pathname);

    // Only redirect if auth check is complete (not checking)
    if (!isCheckingAuth) {
      if (isAuthenticated && isPublicRoute) {
        // Authenticated user on public route - redirect to attendance
        console.log(
          "Redirecting authenticated user from public route to /attendance"
        );
        router.replace("/attendance");
      } else if (!isAuthenticated && isProtectedRoute) {
        // Unauthenticated user on protected route - redirect to login
        console.log(
          "Redirecting unauthenticated user from protected route to /login"
        );
        router.replace("/login");
      }
    }
  }, [isCheckingAuth, isAuthenticated, pathname, router, isClientMounted]);

  // Show loading while checking auth or during SSR/hydration
  if (!isClientMounted || isCheckingAuth) {
    return <AbstergoLoader />;
  }

  return <>{children}</>;
}
