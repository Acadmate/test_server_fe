"use client";
import LoginForm from "@/components/login/form";
import { useAuthStore } from "@/store/authStore";
import "@/components/loading.css";
import { AbstergoLoader } from "@/components/shared/LoadingComponents";

export default function Login() {
  const { isCheckingAuth } = useAuthStore();

  // Show loading state while AuthGuard handles authentication check
  if (isCheckingAuth) {
    return <AbstergoLoader />;
  }

  return (
    <div className="pattern-bg flex flex-col min-h-screen w-full justify-center p-4 md:p-12">
      <div className="flex flex-row bg-gray-300 dark:bg-[#171B26] rounded-lg overflow-hidden md:flex-row justify-center mx-auto w-full max-w-screen-lg">
        <div className="flex flex-col w-full md:w-1/2 p-1 md:p-8 gap-6 md:rounded-r-lg">
          <div className="flex flex-row justify-between items-center px-4">
            <p className="text-3xl lg:text-4xl font-extrabold">Acadmate</p>
            {/* <div className="pt-1">
              <Toggle />
            </div> */}
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
