"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback } from "react";
import { signout } from "@/actions/signout";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { RefreshCw } from "lucide-react";

function NavbarComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const { checkForUpdates, isUpdateAvailable } = useServiceWorkerUpdate();

  const handleSignOut = useCallback(async () => {
    try {
      const response = await signout();

      if (response && (response.success || response.ok)) {
        router.replace("/login");
        router.refresh();
      } else {
        console.error("Sign out returned unsuccessful status");
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [router]);

  const handleCheckForUpdates = useCallback(async () => {
    try {
      await checkForUpdates();
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }, [checkForUpdates]);

  if (
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/maintenance"
  ) {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between mx-auto h-[60px] md:h-[80px] w-screen lg:hidden border-b-2 dark:border-gray-500/20 p-2">
      <div className="flex flex-row gap-3">
        <Link href="/attendance" className="text-3xl font-extrabold mx-2">
          Acadmate
        </Link>
      </div>
      <div className="flex flex-row gap-2">
        {isUpdateAvailable && (
          <button
            onClick={handleCheckForUpdates}
            className="flex flex-row text-sm md:text-base font-bold bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 h-fit w-fit items-center justify-center gap-1 transition-colors"
            title="Update available - Click to update"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Update</span>
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="flex flex-row text-sm md:text-base font-bold bg-red-400 hover:bg-red-500 text-black rounded px-2 py-1 h-fit w-fit items-center justify-center transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export const Navbar = memo(NavbarComponent);
