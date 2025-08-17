import { useState, useEffect, useRef, useMemo, memo } from "react";
import React from "react";
import useMonth from "@/store/calendarMonth";

const monthMap = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
} as const;

type MonthKey = keyof typeof monthMap;

type EventData = {
  Date: string;
  Day: string;
  DayOrder: string;
  Event: string;
};

type CalendarProps = {
  data: {
    [month: string]: EventData[];
  };
};

const CalendarDay = memo(
  React.forwardRef<HTMLDivElement, {
    event: EventData;
    isCurrentDay: boolean;
    monthName: string;
    currentMonth: number;
  }>(({ 
    event,
    isCurrentDay,
    monthName,
    currentMonth,
  }, ref) => {
  // Determine the background color based on conditions
  const bgClass = useMemo(() => {
    if (isCurrentDay && currentMonth === new Date().getMonth() + 1) {
      return "bg-green-300/40 dark:bg-[#15241b] text-black/60 dark:text-[#C1FF72] border-none dark:border-2 dark:border-dashed dark:border-[#C1FF72]";
    } else if (event.DayOrder === "-") {
      return "bg-orange-300/40 dark:bg-[#2e2a14] text-black/60 dark:text-[#FFDD70]";
    } else {
      return "bg-gray-100 text-black/60 dark:text-white dark:bg-black";
    }
  }, [isCurrentDay, currentMonth, event.DayOrder]);

  // Determine overlay visibility
  const overlayClass = useMemo(() => {
    return isCurrentDay && currentMonth === new Date().getMonth() + 1
      ? "hidden"
      : "dark:bg-black/30";
  }, [isCurrentDay, currentMonth]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden flex flex-col justify-between p-5 lg:p-8 mx-2 my-3 rounded-2xl h-fit ${bgClass}`}
    >
      <div className={`absolute inset-0 ${overlayClass} z-10`}></div>
      <div className="flex flex-row justify-between items-center mx-1 lg:mb-2 text-lg lg:text-2xl">
        <div>{event.Day}</div>
        {event.DayOrder === "-" ? (
          <div className="text-lg font-bold">Holiday</div>
        ) : (
          <div className="text-lg font-bold">Day Order {event.DayOrder}</div>
        )}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col w-[40%] justify-start">
          <span className="text-[50px] leading-[55px] lg:text-[80px] lg:leading-[80px] font-thin">
            {event.Date}
            <br />
            {monthName.slice(0, 3)}
          </span>
        </div>
        <div className="flex flex-col justify-center w-[60%] gap-1 h-fit my-auto">
          {event.Event !== "" && (
            <>
              <div className="font-bold text-lg">Event:</div>
              <div className="flex flex-col flex-wrap text-wrap text-xs md:text-base truncate">
                {event.Event}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}));

// Ensure display name is set for memo component
CalendarDay.displayName = "CalendarDay";

function MainCal({ data }: CalendarProps) {
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const currentDayRef = useRef<HTMLDivElement | null>(null);
  const { month, setMonth } = useMonth();

  useEffect(() => {
    const currentDate = new Date();
    setCurrentDay(currentDate.getDate());
    setMonth(currentDate.getMonth() + 1);
  }, [setMonth]); // Include setMonth since it's from a custom hook

  useEffect(() => {
    if (currentDayRef.current) {
      currentDayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentDay, month]);

  // Memoize monthName to prevent unnecessary recalculations
  const monthName = useMemo(() => 
    month ? monthMap[month as MonthKey] : "", 
  [month]);

  // Memoize events for the selected month
  const eventsForMonth = useMemo(() => 
    data[monthName] || [], 
  [data, monthName]);

  return (
    <div className="flex flex-col text-white border-box w-[95vw] lg:w-[73vw]">
      {eventsForMonth.length === 0 ? (
        <div className="text-center text-lg">No calendar data available</div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mx-auto dark:bg-[#15241b] text-gray-600 dark:text-[#C1FF72] px-5 py-1 rounded-full">
            {monthName}
          </h2>
          {eventsForMonth.map((event, index) => (
            <CalendarDay
              key={`${monthName}-${index}`}
              event={event}
              isCurrentDay={index + 1 === currentDay}
              monthName={monthName}
              currentMonth={month as number}
              ref={index + 1 === currentDay ? currentDayRef : null}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default memo(MainCal);