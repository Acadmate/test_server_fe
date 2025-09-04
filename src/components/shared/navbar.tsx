"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback } from "react";

function NavbarComponent() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = useCallback(async () => {
    try {
      const response = await fetch(`${api_url}/signout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.clear();
        router.replace("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }, [api_url, router]);

  if (pathname === "/login" || pathname === "/" || pathname === "/maintenance") {
    return null;
  }

  return (
    <div className="flex flex-row items-center justify-between mx-auto h-[60px] md:h-[80px] w-screen lg:hidden border-b-2 dark:border-gray-500/20 p-2">
      <div className="flex flex-row gap-3">
        <Link href="/attendance" className="text-3xl font-extrabold mx-2">
          Acadmate
        </Link>
      </div>
      <button
        onClick={handleSignOut}
        className="flex flex-row text-sm md:text-base font-bold bg-red-400 text-black rounded px-2 py-1 h-fit w-fit items-center justify-center"
      >
        Sign Out
      </button>
    </div>
  );
}

export const Navbar = memo(NavbarComponent);
