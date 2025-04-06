"use client";
import { memo, useState, useEffect } from "react";
import Margin from "@/components/attendance/margin";
import dynamic from "next/dynamic";
import Title from "../shared/title";
import { FaExclamationCircle } from "react-icons/fa";
import usePredictedButton from "@/store/predictButtonState";
import { useInView } from "react-intersection-observer";

const Alert = dynamic(() => import("@/components/shared/alert"), {
  ssr: false,
  loading: () => <div className="w-[60px] h-[60px]"></div>
});

type AttendanceRecord = {
  "Course Code": string;
  "Course Title": string;
  Category: string;
  "Faculty Name": string;
  Slot: string;
  "Hours Conducted": string;
  "Hours Absent": string;
  "Attn %": string;
};

type MainProps = {
  data: AttendanceRecord[];
};

const AttendanceItem = memo(({ item, index, showPredicted }: { 
  item: AttendanceRecord, 
  index: number,
  showPredicted: boolean
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (inView && !isLoaded) {
      setIsLoaded(true);
    }
  }, [inView, isLoaded]);

  // If not in view and not yet loaded, render a placeholder
  if (!isLoaded) {
    return (
      <div 
        ref={ref}
        className={`flex flex-col rounded-2xl ${
          index % 2 === 0
            ? "bg-gray-100 dark:bg-[#171B26]"
            : "dark:bg-black"
        } items-center px-3 py-2 gap-2 h-24`}
      />
    );
  }

  const hoursConducted = parseInt(item["Hours Conducted"]);
  const hoursAbsent = parseInt(item["Hours Absent"]);
  const attendance = parseFloat(item["Attn %"]);
  const present = hoursConducted - hoursAbsent;
  const isTheory = item.Category.toLowerCase() === "theory";
  const courseCode = item["Course Code"].replace("Regular", "");
  const isLowAttendance = attendance <= 75;
  
  return (
    <div
      className={`flex flex-col rounded-2xl ${
        index % 2 === 0
          ? "bg-gray-100 dark:bg-[#171B26]"
          : "dark:bg-black"
      } items-center px-3 py-2 gap-2`}
    >
      <div className="flex flex-col md:flex-row w-full">
        <div className="flex flex-col gap-2 lg:gap-4 w-full">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center justify-items gap-2">
              <div
                className={`py-1 px-2 rounded-full text-[10px] text-xs w-fit h-fit font-extrabold ${
                  isTheory
                    ? "bg-orange-300 text-black dark:bg-black dark:text-orange-400"
                    : "bg-green-300 text-black dark:bg-black dark:text-green-400"
                }`}
              >
                {item.Category.charAt(0)}
              </div>
              <div
                className={`py-1 px-2 rounded text-xs w-fit h-fit font-extrabold ${
                  isTheory
                    ? "bg-orange-300 text-black dark:bg-black dark:text-orange-400"
                    : "bg-green-300 text-black dark:bg-black dark:text-green-400"
                }`}
              >
                {courseCode}
              </div>
            </div>

            <span className="flex sm:hidden">
              <Margin
                hoursConducted={hoursConducted}
                hoursAbsent={hoursAbsent}
                attendance={attendance}
              />
            </span>
          </div>
          <p className="text-md lg:text-xl font-semibold">
            {item["Course Title"]}
          </p>
        </div>

        <div className="flex flex-row w-full justify-end">
          <div className="flex flex-row w-full md:w-[456px] justify-between items-center">
            <div className="flex flex-row">
              <div className="flex flex-row justify-center items-center px-2 h-fit bg-gray-200 text-black dark:bg-white rounded-l-2xl text-base md:text-md font-bold w-fit gap-[5px]">
                <span className="rounded-[100px] bg-black text-black text-white text-xs px-[5px]">
                  T
                </span>
                {hoursConducted}
              </div>
              <div className="flex flex-row font-bold bg-red-200 dark:bg-[#3C1E1B] text-[#F54B2A] px-2 text-base md:text-md items-center justify-center w-fit h-fit gap-[5px]">
                <span className="text-red-500 rounded-[100px] bg-black text-xs px-[5px]">
                  A
                </span>
                {hoursAbsent}
              </div>
              <div className="flex flex-row justify-center items-center px-2 h-fit bg-green-200 dark:bg-[#1B3C1E] text-base md:text-md rounded-r-2xl text-green-500 dark:text-[#49DE80] font-bold w-fit gap-[5px]">
                <span className="text-green-500 rounded-[100px] bg-black text-xs px-[5px]">
                  P
                </span>
                {present}
              </div>
            </div>
            <div className="hidden sm:flex">
              <Margin
                hoursConducted={hoursConducted}
                hoursAbsent={hoursAbsent}
                attendance={attendance}
              />
            </div>
            {isLowAttendance ? (
              <div className="w-[60px] h-[60px]">
                <Alert />
              </div>
            ) : (
              <div className="w-[60px] h-[60px]"></div>
            )}
            <p
              className={`text-[26px] md:text-3xl font-extrabold text-nowrap ${
                attendance >= 90
                  ? "text-green-400"
                  : attendance >= 75
                  ? "text-orange-300"
                  : "text-red-400"
              }`}
            >
              {attendance} %
            </p>
          </div>
        </div>
      </div>
      <div
        className={`flex-row gap-[3px] w-full text-xs text-black-500 dark:text-yellow-500 ${
          showPredicted ? "flex items-center" : "hidden"
        }`}
      >
        <span>
          <FaExclamationCircle />
        </span>
        <span>Attendance prediction is on</span>
      </div>
    </div>
  );
});

AttendanceItem.displayName = "AttendanceItem";

// Windowing component to render only visible items
// VirtualizedList Component with fixes
const VirtualizedList = memo(({ data, showPredicted }: { 
  data: AttendanceRecord[],
  showPredicted: boolean
}) => {
  const [visibleItems, setVisibleItems] = useState<number>(10);
  
  useEffect(() => {
    // Initialize with more items and add proper scroll event listener
    setVisibleItems(Math.min(10, data.length));
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more items when user scrolls to 80% of the current view
      if (scrollPosition > documentHeight * 0.8) {
        setVisibleItems(prevCount => {
          const newCount = prevCount + 5;
          return Math.min(newCount, data.length);
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.length]);

  return (
    <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-2xl">
      {data.slice(0, visibleItems).map((item, index) => (
        <AttendanceItem 
          key={`${item["Course Code"]}-${index}`}
          item={item}
          index={index}
          showPredicted={showPredicted}
        />
      ))}
      {visibleItems < data.length && (
        <div className="text-center py-4 text-gray-500">
          Scroll to load more...
        </div>
      )}
    </div>
  );
});

VirtualizedList.displayName = "VirtualizedList";

function Main({ data }: MainProps) {
  const { predictedButton } = usePredictedButton();
  
  const hasData = data && data.length > 0;
  
  return (
    <div className="z-30 mx-auto h-fit w-screen lg:w-[73vw] rounded-b p-1">
      <Title />
      {hasData ? (
        <VirtualizedList 
          data={data}
          showPredicted={predictedButton === 1}
        />
      ) : (
        <div className="flex flex-row items-center justify-center h-[20vh] border rounded-[20px] mx-5">
          <p className="text-lg font-bold">No attendance data available.</p>
        </div>
      )}
    </div>
  );
}

export default memo(Main);