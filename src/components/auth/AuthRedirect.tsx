// components/auth/AuthRedirect.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AbstergoLoader } from "@/components/shared/LoadingComponents";

export default function AuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (!isCheckingAuth) {
      if (isAuthenticated) {
        router.replace("/attendance");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  return <AbstergoLoader />;
}
