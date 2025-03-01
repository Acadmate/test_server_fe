"use client";
import { Button } from "@/components/ui/button";
import { IoMenuSharp } from "react-icons/io5";
import { RxCalendar } from "react-icons/rx";
import { IoPerson, IoCalculator } from "react-icons/io5";
// import { IoIosLink } from "react-icons/io";
import { GrCafeteria } from "react-icons/gr";
import { MdOutlineSchedule } from "react-icons/md";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const menu = [
  { name: "Att% and Marks", icon: <IoPerson />, link: "/attendance" },
  { name: "Timetable", icon: <MdOutlineSchedule />, link: "/timetable" },
  { name: "Calendar", icon: <RxCalendar />, link: "/calender" },
  { name: "Gpa Calc", icon: <IoCalculator />, link: "/gpacalc" },
  { name: "Mess Menu", icon: <GrCafeteria />, link: "/messmenu" },
  // { name: "Links", icon: <IoIosLink />, link: "/links" },
];

export function SheetSide() {
  const pathname = usePathname();
  return (
    <div className="hidden lg:flex flex-row w-fit items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="border-none p-0 m-0 h-fit w-fit text-2xl"
            variant="outline"
          >
            <IoMenuSharp />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle className="flex flex-row justify-center items-center text-3xl my-2 w-full">
              Acadmate
            </SheetTitle>
            <SheetDescription className="flex flex-col">
              <span className="font-extrabold text-md">Quick Tip!</span>
              <span className="">
                On mobile, you can quickly open and close the menu by
                double-tapping anywhere on the screen.
              </span>
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col my-6 gap-3 pointer">
            {menu.map((item, index) => (
              <SheetClose asChild key={index}>
                <Link
                  prefetch={true}
                  href={item.link}
                  className={`flex flex-row gap-6 items-center px-2 py-1 rounded ${
                    `${item.link}` == pathname
                      ? "bg-green-100 dark:bg-[#15241b] dark:text-[#C1FF72] transition-all duration-100 transform translate-x-4"
                      : "transform hover:translate-x-2 transition-all duration-300"
                  } pointer`}
                >
                  <span className="text-2xl font-bold pointer">
                    {item.icon}
                  </span>
                  <span className="text-xl font-bold pointer">{item.name}</span>
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
