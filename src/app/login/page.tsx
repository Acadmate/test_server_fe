"use client";
import LoginForm from "@/components/login/form";
import Toggle from "@/components/shared/switchTheme";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("stats") === "true";
    const checkAuthentication = () => {
      if (isAuthenticated) {
        router.push("/attendance");
      } else {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, [router]);
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p className="text-xl font-bold">Checking authentication...</p>
      </div>
    );
  }
  return (
    <div className="flex flex-row rounded-lg overflow-hidden md:flex-row justify-center mx-auto mt-32 md:mt-20 lg:mt-24 w-full max-w-screen-lg">
      <div className="flex flex-col w-full md:w-1/2 p-1 md:p-8 gap-6 md:rounded-r-lg">
        <div className="flex flex-row justify-between items-center px-4">
          <p className="text-3xl lg:text-4xl font-extrabold">Acadmate</p>
          <div className="pt-1">
            <Toggle />
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
