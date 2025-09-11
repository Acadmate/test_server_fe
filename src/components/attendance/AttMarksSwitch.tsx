"use client";
import { useState, memo } from "react";
import { BsGraphUp } from "react-icons/bs";
import { BsPersonCheck } from "react-icons/bs";
import { MdOutlineDashboard } from "react-icons/md";
import useScrollMrks from "@/store/mrksScroll";

const NavButton = memo(({ 
  icon, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode; 
  isActive: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 ${
      isActive
        ? "dark:bg-[#1B3C1E] bg-green-200 text-green-500 border border-green-500"
        : "text-black dark:text-gray-400"
    }`}
  >
    {icon}
  </div>
));

NavButton.displayName = "NavButton";

const Divider = memo(() => (
  <div className="border-[0.5px] h-8 border-gray-400 dark:border-gray-700 rounded"></div>
));

Divider.displayName = "Divider";

function AttMarksSwitch() {
  const { setSection } = useScrollMrks();
  const [select, isSelected] = useState("");

  const handleNavClick = (section: string) => {
    isSelected(section);
    setSection(section);
  };

  return (
    <div className="fixed flex flex-row items-center justify-center bottom-6 w-full md:hidden">
      <div className="fixed p-1 gap-1 bottom-6 items-center justify-center flex flex-row bg-gray-100 dark:bg-black/90 w-fit h-fit rounded-xl border border-gray-400 dark:border-gray-700">
        <NavButton 
          icon={<MdOutlineDashboard />} 
          isActive={select === "dashboard"}
          onClick={() => handleNavClick("dashboard")}
        />
        <Divider />
        <NavButton 
          icon={<BsPersonCheck />} 
          isActive={select === "attendance"}
          onClick={() => handleNavClick("attendance")}
        />
        <Divider />
        <NavButton 
          icon={<BsGraphUp />} 
          isActive={select === "marks"}
          onClick={() => handleNavClick("marks")}
        />
      </div>
    </div>
  );
}

export default memo(AttMarksSwitch);