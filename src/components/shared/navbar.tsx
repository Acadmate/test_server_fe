"use client";
// import Image from "next/image";
import Link from "next/link";
import { signout } from "@/actions/signout";
import { usePathname } from "next/navigation";
import { SheetSide } from "./sheetNav";

export default function Navbar() {
  function clear() {
    localStorage.clear();
    signout();
  }
  const pathname = usePathname();
  return (
    <>
      {pathname != "/login" && pathname != "/" ? (
        <div className="flex flex-row items-center justify-between mx-auto h-[60px] md:h-[80px] w-screen lg:w-[73vw] h-16 border-b-2 dark:border-gray-500/20 p-2">
          {/* <Image src="" alt="AcadBud" /> */}
          <div className="flex flex-row gap-3">
            <SheetSide />
            <Link href="/attendance" className="text-3xl font-extrabold mx-2">
              Acadmate
            </Link>
          </div>
          <Link
            href="/"
            onClick={clear}
            className="flex flex-row text-sm md:text-base font-bold bg-red-400 text-black rounded px-2 py-1 rounded h-fit w-fit items-center justify-center"
          >
            Sign Out
          </Link>
        </div>
      ) : null}
    </>
  );
}
