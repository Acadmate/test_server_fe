"use client";

import { RxCalendar } from "react-icons/rx";
import { IoPerson, IoCalculator } from "react-icons/io5";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GrCafeteria } from "react-icons/gr";
import { MdOutlineSchedule } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useMemo, useCallback } from "react";
import { Github } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { signout } from "@/actions/signout";
import { FaFolder } from "react-icons/fa";
import logo from "../../../public/assets/images/logo.png"
import Image from "next/image";

const menu = [
  { name: "Att% and Marks", icon: <IoPerson />, link: "/attendance" },
  { name: "Timetable", icon: <MdOutlineSchedule />, link: "/timetable" },
  { name: "Calendar", icon: <RxCalendar />, link: "/calender" },
  { name: "Gpa Calc", icon: <IoCalculator />, link: "/gpacalc" },
  { name: "Mess Menu", icon: <GrCafeteria />, link: "/messmenu" },
  { name: "Your Info", icon: <IoInformationCircleOutline />, link: "/info" },
  { name: "Super Docs", icon: <FaFolder />, link: "/supadocs" }
];

function SheetSideComponent() {
  const pathname = usePathname();
  const router = useRouter();

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

  const memoizedLinks = useMemo(() => {
    return menu.map((item, index) => (
      <Link
        key={index}
        href={item.link}
        className={`flex items-center gap-4 px-2 py-2 rounded-lg ${
          item.link === pathname
            ? "bg-green-100 dark:bg-[#15241b] dark:text-[#C1FF72] font-semibold"
            : "hover:translate-x-2 transition-transform duration-200"
        }`}
      >
        <span className="text-2xl">{item.icon}</span>
        <span className="text-lg font-bold">{item.name}</span>
      </Link>
    ));
  }, [pathname]);

  if (pathname === "/" || pathname === "/login") {
    return null;
  }  

  return (
    <div className="hidden lg:flex flex-col w-[25vw] h-screen fixed left-0 top-0 z-40 pl-2 py-2 rounded-xl">
      <div className="h-full w-full bg-white dark:bg-[#0F0F0F] shadow-md border px-4 py-6 rounded-xl flex flex-col">
        <div className="text-3xl font-extrabold text-center mb-4">
          <Image src={logo} alt="logo" width={100} height={100} className="w-full h-8 object-contain" />
        </div>
        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto overflow-x-hidden">
          {memoizedLinks}
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex flex-row text-sm md:text-base font-bold bg-red-400 text-black rounded px-4 py-2 w-full items-center justify-center hover:bg-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
      <div className="mt-auto pt-6 px-2">
        <h2 className="text-lg font-bold mb-3">Join Our Community</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Be part of our growing community! Get updates on new features, report bugs, and contribute to make Acadmate better.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            href="https://github.com/yourusername/acadmate"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="font-medium">Contribute on GitHub</span>
          </Link>
          <Link
            href="https://chat.whatsapp.com/LLycZyCPoY5JZVu0QqR1Nv"
            className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-[#15241b] rounded-lg hover:bg-green-200 dark:hover:bg-[#1a2e22] transition-colors"
          >
            <BsWhatsapp className="w-5 h-5" />
            <span className="font-medium">Join Community</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const SheetSide = memo(SheetSideComponent);