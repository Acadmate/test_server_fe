"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import Hammer from "hammerjs";
import useMenu from "@/store/menustate";
import Link from "next/link";
import { RxCalendar } from "react-icons/rx";
import { IoPerson, IoCalculator } from "react-icons/io5";
import { GrCafeteria } from "react-icons/gr";
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

  // 🔁 Handle double tap on body to show/hide menu
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

  // 🎯 Animate open state
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsMenuFullyOpened(true), 150);
    } else {
      setIsMenuFullyOpened(false);
    }
  }, [isVisible]);

  // 🚫 Prevent scroll when menu is visible
  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  // 🖐 Close menu on tap inside menu
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

  // 🧠 Memoize menu items
  const menuItems = useMemo(() => [
    { id: "calendar", href: "/calender", icon: <RxCalendar />, label: "Calendar" },
    {
      id: "dashboard",
      href: "/attendance",
      icon: <IoPerson />,
      label: <span className="text-nowrap">Dashboard</span>,
    },
    { id: "gpacalc", href: "/gpacalc", icon: <IoCalculator />, label: "GPA Calc" },
    { id: "timetable", href: "/timetable", icon: <MdOutlineSchedule />, label: "Timetable" },
    { id: "messmenu", href: "/messmenu", icon: <GrCafeteria />, label: "Mess Menu" },
    {
      id: "supadocs",
      href: "/supadocs",
      icon: (
        <div className="flex flex-row z-10 items-center">
          <span className="relative flex flex-row items-center inline-block">
            <span className="text-xl"><FaFolder /></span>
            <span className="absolute text-white top-[8px] transform translate-x-1/4 -translate-y-1/4 text-[12px] rotate-210">
              <BiSolidZap />
            </span>
          </span>
        </div>
      ),
      label: "SupaDocs",
    },
  ], []);

  // 💡 Memoize positions for circular layout
  const menuPositions = useMemo(() => {
    return menuItems.map((_, index) => {
      const angle = (index / menuItems.length) * 2 * Math.PI;
      return {
        top: `calc(50% - 40px + ${Math.sin(angle) * 120}px)`,
        left: `calc(50% - 40px + ${Math.cos(angle) * 120}px)`,
      };
    });
  }, [menuItems.length]);

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
        <div className="relative w-[400px] h-[400px]">
          <div className="relative w-fit h-full mx-auto">
            {menuItems.map((item, index) => (
              <Link
                prefetch
                key={item.id}
                className={`absolute flex flex-col items-center justify-center w-fit h-fit text-xs font-bold p-1 rounded ${
                  path === item.href ? "bg-[#C1FF72]/80 text-black" : ""
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
                <span className="text-2xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
