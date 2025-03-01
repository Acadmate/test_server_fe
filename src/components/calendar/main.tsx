import { useState, useEffect, useRef } from "react";

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

type CalendarProps = {
  data: {
    [month: string]: {
      Date: string;
      Day: string;
      DayOrder: string;
      Event: string;
    }[];
  };
};

export default function MainCal({ data }: CalendarProps) {
  const currentDate = new Date();
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<number | null>(null);
  const currentDayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentDay(currentDate.getDate());
    setCurrentMonth(currentDate.getMonth() + 1);
  }, []);

  useEffect(() => {
    if (currentDayRef.current) {
      currentDayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentDay]);

  const monthName = currentMonth ? monthMap[currentMonth as MonthKey] : "";

  const eventsForMonth = data[monthName] || [];

  return (
    <div className="flex flex-col text-white border-box w-[95vw] lg:w-[73vw]">
      {eventsForMonth.length === 0 ? (
        <div className="text-center text-lg">No calendar data available</div>
      ) : (
        <>
          <h2 className="text-3xl font-bold mx-auto my-1 dark:bg-[#15241b] dark:text-[#C1FF72] px-5 py-1 rounded-full">
            {monthName}
          </h2>
          {eventsForMonth.map((event, index) => (
            <div
              key={index}
              ref={index + 1 === currentDay ? currentDayRef : null}
              className={`relative overflow-hidden flex flex-col justify-between p-5 lg:p-8  mx-2 my-3 rounded-2xl h-fit ${
                index + 1 == currentDay
                  ? "bg-green-300/40 dark:bg-[#15241b] text-black/60 dark:text-[#C1FF72] border-none dark:border-2 dark:border-dashed dark:border-[#C1FF72]"
                  : event.DayOrder == "-"
                  ? "bg-orange-300/40 dark:bg-[#2e2a14] text-black/60 dark:text-[#FFDD70]"
                  : "bg-gray-100 text-black/60 dark:text-white dark:bg-black"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  index + 1 == currentDay ? "hidden" : "dark:bg-black/30"
                } z-10`}
              ></div>
              <div className="flex flex-row justify-between items-center mx-1 lg:mb-2 text-lg lg:text-2xl">
                <div>{event.Day}</div>
                {event.DayOrder == "-" ? (
                  <div className="text-lg font-bold">Holiday</div>
                ) : (
                  <div className="text-lg font-bold">
                    Day Order {event.DayOrder}
                  </div>
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
                  {event.Event == "" ? (
                    ""
                  ) : (
                    <>
                      <div className="font-bold text-lg">Event:</div>
                      <div className="flex flex-col flex-wrap text-wrap text-xs md:text-base truncate">
                        {event.Event || ""}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
