import { RxCalendar } from "react-icons/rx";
import { GrScorecard, GrCafeteria } from "react-icons/gr";
import { IoPerson, IoCalculator } from "react-icons/io5";
import { MdOutlineSchedule } from "react-icons/md";
import { BiSolidZap } from "react-icons/bi";
import { FaExclamationCircle } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import useScrollMrks from "@/store/mrksScroll";
import Toggle from "./switchTheme";
import Link from "next/link";

export default function DashboardMenu() {
  const { setSection } = useScrollMrks();
  const menuItems = [
    {
      id: "calendar",
      href: "/calender",
      icon: <RxCalendar />,
      label: "Calendar",
    },
    { id: "marks", href: "/attendance", icon: <GrScorecard />, label: "Marks" },
    {
      id: "attendance",
      href: "/attendance",
      icon: <IoPerson />,
      label: (
        <>
          <span className="text-nowrap">Attendance</span>
        </>
      ),
    },
    {
      id: "gpacalc",
      href: "/gpacalc",
      icon: <IoCalculator />,
      label: "GPA Calc",
    },
    {
      id: "timetable",
      href: "/timetable",
      icon: <MdOutlineSchedule />,
      label: "Timetable",
    },
    // { id: "links", href: "/links", icon: <IoIosLink />, label: "Imp Links" },
    {
      id: "messmenu",
      href: "/messmenu",
      icon: <GrCafeteria />,
      label: "Mess Menu",
    },
    {
      id: "supadocs",
      href: "/supadocs",
      icon: (
        <div className="flex flex-row z-10 items-center">
          <span className="relative flex flex-row items-center inline-block">
            <span className="text-xl text-black dark:text-white">
              <FaFolder />
            </span>
            <span className="absolute text-white dark:text-black top-[8px] transform translate-x-1/4 -translate-y-1/4 text-[12px] rotate-210">
              <BiSolidZap />
            </span>
          </span>
        </div>
      ),
      label: "SupaDocs",
    },

    // { id: "logs", href: "/logs", icon: <IoIosLink />, label: "Logs" },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex flex-row w-full justify-between items-center px-4">
        <div className={`flex flex-row items-center w-fit h-fit`}>
          <h1 className="text-2xl font-bold">Navigate</h1>
        </div>
        <Toggle />
      </div>
      <div className="flex flex-row text-xs gap-1 px-4 py-1 dark:text-yellow-400 items-center">
        <span>
          <FaExclamationCircle />
        </span>
        <p>To open quick menu, quick double tap anywhere on screen.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-rows-2 md:grid-cols-3 gap-2 w-full p-2">
        {menuItems.map((item) => (
          <Link
            href={item.href}
            key={item.id}
            onClick={() => setSection(item.id)}
            className="flex flex-row items-center border border-gray-300 dark:border-gray-700 h-14 dark:text-white dark:bg-[#171B26] py-2 px-4 rounded hover:text-green-400 dark:hover:text-green-400 transition-all duration-400"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
