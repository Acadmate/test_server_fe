"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Hammer from "hammerjs";
import useMenu from "@/store/menustate";
import Link from "next/link";
import { RxCalendar } from "react-icons/rx";
import { IoPerson, IoCalculator } from "react-icons/io5";
import { GrCafeteria } from "react-icons/gr";
import { IoInformationCircleOutline } from "react-icons/io5";
import { MdOutlineSchedule } from "react-icons/md";
import { usePathname } from "next/navigation";
import { BiSolidZap } from "react-icons/bi";
import { FaFolder } from "react-icons/fa";
import useScrollMrks from "@/store/mrksScroll";

export default function Menu() {
  const path = usePathname();
  const { isVisible, show, hide } = useMenu();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMenuFullyOpened, setIsMenuFullyOpened] = useState(false);
  const { section, setSection } = useScrollMrks();

  const isLargeScreen = () => window.innerWidth >= 1024;

  useEffect(() => {
    if (isLargeScreen()) return;

    const hammer = new Hammer(document.body, {
      recognizers: [
        [Hammer.Tap, { taps: 2, interval: 400, threshold: 10, posThreshold: 50 }],
      ],
    });

    hammer.on("tap", (event) => {
      event.preventDefault();
      event.srcEvent.stopPropagation();
      isVisible ? hide() : show();
    });

    return () => hammer.destroy();
  }, [isVisible, hide, show]);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsMenuFullyOpened(true), 150);
    } else {
      setIsMenuFullyOpened(false);
    }
  }, [isVisible]);

  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    if (isLargeScreen() || !menuRef.current) return;

    const menuHammer = new Hammer(menuRef.current, {
      recognizers: [[Hammer.Tap, { taps: 2, interval: 300, threshold: 10 }]],
    });

    menuHammer.on("tap", (event) => {
      event.preventDefault();
      event.srcEvent.stopPropagation();
      hide();
    });

    return () => menuHammer.destroy();
  }, [hide]);

  const menuItems = useMemo(() => [
    { 
      id: "calendar", 
      href: "/calender", 
      icon: <RxCalendar className="text-2xl" />, 
      label: "Calendar" 
    },
    { 
      id: "your info", 
      href: "/info", 
      icon: <IoInformationCircleOutline className="text-2xl" />, 
      label: "Your Info" 
    },
    {
      id: "dashboard",
      href: "/attendance",
      icon: <IoPerson className="text-2xl" />,
      label: "Dashboard",
    },
    { 
      id: "gpacalc", 
      href: "/gpacalc", 
      icon: <IoCalculator className="text-2xl" />, 
      label: "GPA Calc" 
    },
    { 
      id: "timetable", 
      href: "/timetable", 
      icon: <MdOutlineSchedule className="text-2xl" />, 
      label: "Timetable" 
    },
    { 
      id: "messmenu", 
      href: "/messmenu", 
      icon: <GrCafeteria className="text-2xl" />, 
      label: "Mess Menu" 
    },
    {
      id: "supadocs",
      href: "/supadocs",
      icon: (
        <div className="relative flex items-center justify-center text-2xl">
          <FaFolder />
          <BiSolidZap className="absolute text-white text-xs top-1 right-0 transform translate-x-1/2 -translate-y-1/2" />
        </div>
      ),
      label: "SupaDocs",
    },
  ], []);

  const sortedMenuItems = useMemo(() => {
    return menuItems.sort((a, b) => a.label.localeCompare(b.label));
  }, [menuItems]);

  const menuPositions = useMemo(() => {
    return menuItems.map((_, index) => {
      const angle = (index / menuItems.length) * 2 * Math.PI;
      return {
        top: `calc(50% - 50px + ${Math.sin(angle) * 130}px)`,
        left: `calc(50% - 50px + ${Math.cos(angle) * 130}px)`,
      };
    });
  }, [menuItems]);

  const handleMenuClick = (item: typeof menuItems[number]) => {
    if (section !== item.id) {
      setSection(item.id);
    }
    hide();
  };

  if (path === "/login" || path === "/") return null;

  return (
    <div className="z-50 w-fit h-fit lg:hidden">
      <div
        ref={menuRef}
        className={`flex items-center justify-center z-50 text-white bg-black/90 dark:bg-black/85 backdrop-blur-sm fixed inset-0 transition-opacity duration-150 ${
          isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative w-[500px] h-[500px]">
          <div className="relative w-fit h-full mx-auto">
            {sortedMenuItems.map((item, index) => (
              <Link
                prefetch
                key={item.id}
                className={`absolute flex flex-col items-center justify-center w-20 h-20 text-sm font-semibold gap-1 rounded-xl transition-all duration-200 ${
                  path === item.href 
                    ? "bg-[#C1FF72]/90 text-black shadow-lg scale-110" 
                    : "hover:bg-white/10 hover:scale-105"
                }`}
                href={isMenuFullyOpened ? item.href : "#"}
                onClick={(e) => {
                  if (!isMenuFullyOpened) {
                    e.preventDefault();
                    return;
                  }
                  handleMenuClick(item);
                }}
                style={menuPositions[index]}
              >
                <div className="flex items-center justify-center h-8 w-8">
                  {item.icon}
                </div>
                <span className="text-center text-xs leading-tight whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}