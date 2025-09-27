"use client";
import { memo, useRef } from "react";
import { BsGraphUp, BsPersonCheck } from "react-icons/bs";
import { MdOutlineDashboard } from "react-icons/md";
import useScrollMrks from "@/store/mrksScroll";
import { Link } from "react-scroll";

const NavButton = memo(
  ({ icon, isActive }: { icon: React.ReactNode; isActive: boolean }) => (
    <div
      className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 transition-colors duration-300 ${
        isActive
          ? "dark:bg-[#1B3C1E] bg-green-200 text-green-500 border border-green-500"
          : "text-black dark:text-gray-400"
      }`}
    >
      {icon}
    </div>
  )
);
NavButton.displayName = "NavButton";

const Divider = memo(() => (
  <div className="border-[0.5px] h-8 border-gray-400 dark:border-gray-700 rounded"></div>
));
Divider.displayName = "Divider";

function AttMarksSwitch() {
  const { section, setSection } = useScrollMrks();
  const isScrollingRef = useRef(false);

  const handleSetActive = (to: string) => {
    // Only update state if we're not programmatically scrolling
    if (!isScrollingRef.current) {
      setSection(to);
    }
  };

  const handleLinkClick = (to: string) => {
    // Set flag to prevent state conflicts during programmatic scroll
    isScrollingRef.current = true;
    setSection(to);

    // Clear flag after scroll animation completes
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000); // Slightly longer than scroll duration to be safe
  };

  return (
    <div className="fixed flex flex-row items-center justify-center bottom-6 w-full md:hidden">
      <div className="fixed p-1 gap-1 bottom-6 items-center justify-center flex flex-row bg-gray-100 dark:bg-black/90 w-fit h-fit rounded-xl border border-gray-400 dark:border-gray-700">
        <Link
          to="dashboard"
          spy={true}
          smooth={true}
          duration={800}
          onSetActive={handleSetActive}
          onClick={() => handleLinkClick("dashboard")}
          offset={-80}
        >
          <NavButton
            icon={<MdOutlineDashboard />}
            isActive={section === "dashboard"}
          />
        </Link>

        <Divider />

        <Link
          to="att-section"
          spy={true}
          smooth={true}
          duration={800}
          onSetActive={handleSetActive}
          onClick={() => handleLinkClick("att-section")}
          offset={-80}
        >
          <NavButton
            icon={<BsPersonCheck />}
            isActive={section === "att-section"}
          />
        </Link>

        <Divider />

        <Link
          to="marks-section"
          spy={true}
          smooth={true}
          duration={800}
          onSetActive={handleSetActive}
          onClick={() => handleLinkClick("marks-section")}
          offset={-120}
        >
          <NavButton
            icon={<BsGraphUp />}
            isActive={section === "marks-section"}
          />
        </Link>
      </div>
    </div>
  );
}

export default memo(AttMarksSwitch);
