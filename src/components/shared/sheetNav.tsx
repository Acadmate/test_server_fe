"use client";

import { RxCalendar } from "react-icons/rx";
import { IoPerson, IoCalculator } from "react-icons/io5";
import { GrCafeteria } from "react-icons/gr";
import { MdOutlineSchedule } from "react-icons/md";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo, useMemo, useCallback } from "react";
import { Github } from "lucide-react";
import { BsWhatsapp } from "react-icons/bs";
import { signout } from "@/actions/signout";

const menu = [
  { name: "Att% and Marks", icon: <IoPerson />, link: "/attendance" },
  { name: "Timetable", icon: <MdOutlineSchedule />, link: "/timetable" },
  { name: "Calendar", icon: <RxCalendar />, link: "/calender" },
  { name: "Gpa Calc", icon: <IoCalculator />, link: "/gpacalc" },
  { name: "Mess Menu", icon: <GrCafeteria />, link: "/messmenu" },
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

  return (
    <div className="hidden lg:flex flex-col w-[25vw] h-screen fixed left-0 top-0 z-40 pl-2 py-2 rounded-xl">
      <div className="h-full w-full bg-white dark:bg-[#0F0F0F] shadow-md border px-4 py-6 rounded-xl relative">
        <h1 className="text-3xl font-extrabold text-center mb-6">Acadmate</h1>
        <div className="mb-4">
          <p className="text-sm font-bold mb-1">Quick Tip!</p>
          <p className="text-sm">
            On mobile, you can double-tap anywhere to open the menu.
          </p>
        </div>
        <nav className="flex flex-col gap-3">
          {memoizedLinks}
          <button
            onClick={handleSignOut}
            className="flex flex-row text-sm md:text-base font-bold bg-red-400 text-black rounded px-2 py-1 h-fit w-fit items-center justify-center absolute bottom-4"
          >
            Sign Out
          </button>
        </nav>
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