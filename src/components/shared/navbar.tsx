"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SheetSide } from "./sheetNav";

export default function Navbar() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
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
  };

  if (pathname === "/login" || pathname === "/" || pathname === "/maintenance")
    return null;

  return (
    <div className="flex flex-row items-center justify-between mx-auto h-[60px] md:h-[80px] w-screen lg:w-[73vw] border-b-2 dark:border-gray-500/20 p-2">
      <div className="flex flex-row gap-3">
        <SheetSide />
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
