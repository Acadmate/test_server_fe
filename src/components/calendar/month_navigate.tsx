import { memo, useMemo } from "react";
import { IoCaretForwardOutline, IoCaretBackOutline } from "react-icons/io5";
import useMonth from "@/store/calendarMonth";

const FULL_MONTH_MAP = {
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

type MonthKey = keyof typeof FULL_MONTH_MAP;
type MonthNavigateProps = {
  availableMonths: number[]; // Array of month numbers (1-12) that have data
  calendarData: Record<string, unknown>;
};

function MonthNavigate({ availableMonths, calendarData }: MonthNavigateProps) {
  const { month, setMonth } = useMonth();
  
  // Create a map of only available months
  const availableMonthMap = useMemo(() => {
    // If no months are specified as available, check the calendar data
    if (!availableMonths || availableMonths.length === 0) {
      const monthsFromData = Object.keys(calendarData || {})
        .map(monthName => {
          // Find the month number from the month name
          const entry = Object.entries(FULL_MONTH_MAP).find(
            ([, name]) => name === monthName
          );
          return entry ? parseInt(entry[0]) : null;
        })
        .filter((m): m is number => m !== null)
        .sort((a, b) => a - b);
      
      return monthsFromData.length > 0 
        ? monthsFromData.reduce((acc, monthNum) => {
            acc[monthNum] = FULL_MONTH_MAP[monthNum as MonthKey];
            return acc;
          }, {} as Record<number, string>)
        : FULL_MONTH_MAP; // Fallback to all months if no data
    }
    
    // Otherwise use the specified available months
    return availableMonths.reduce((acc, monthNum) => {
      if (monthNum >= 1 && monthNum <= 12) {
        acc[monthNum] = FULL_MONTH_MAP[monthNum as MonthKey];
      }
      return acc;
    }, {} as Record<number, string>);
  }, [availableMonths, calendarData]);
  
  // Get sorted array of available month numbers
  const sortedMonthNumbers = useMemo(() => 
    Object.keys(availableMonthMap).map(Number).sort((a, b) => a - b),
  [availableMonthMap]);

  // Handle navigation with available months only
  const handlePreviousMonth = () => {
    if (sortedMonthNumbers.length === 0) return;
    
    const currentIndex = sortedMonthNumbers.indexOf(month);
    if (currentIndex <= 0) {
      // Wrap to the last month if at the beginning
      setMonth(sortedMonthNumbers[sortedMonthNumbers.length - 1]);
    } else {
      setMonth(sortedMonthNumbers[currentIndex - 1]);
    }
  };

  const handleNextMonth = () => {
    if (sortedMonthNumbers.length === 0) return;
    
    const currentIndex = sortedMonthNumbers.indexOf(month);
    if (currentIndex === -1 || currentIndex === sortedMonthNumbers.length - 1) {
      // Wrap to the first month if at the end
      setMonth(sortedMonthNumbers[0]);
    } else {
      setMonth(sortedMonthNumbers[currentIndex + 1]);
    }
  };

  // Set default month if current month is not in available months
  useMemo(() => {
    if (sortedMonthNumbers.length > 0 && !sortedMonthNumbers.includes(month)) {
      // Find closest month to current date
      const currentDate = new Date();
      const currentMonthNum = currentDate.getMonth() + 1;
      
      const closestMonth = sortedMonthNumbers.reduce((prev, curr) => {
        return Math.abs(curr - currentMonthNum) < Math.abs(prev - currentMonthNum) 
          ? curr 
          : prev;
      });
      
      setMonth(closestMonth);
    }
  }, [sortedMonthNumbers, month, setMonth]);

  // Determine if we have any months to display
  if (sortedMonthNumbers.length === 0) {
    return null; // Don't render the component if no months are available
  }

  // Calculate available month count for UI indicator
  const monthCount = sortedMonthNumbers.length;
  const currentMonthName = availableMonthMap[month as keyof typeof availableMonthMap] || "Loading...";

  return (
    <div className="fixed flex flex-col items-center justify-center bottom-6 w-[95vw] lg:w-[72vw] mx-auto z-40">
      <div className="p-1 gap-1 items-center justify-center flex flex-row bg-gray-100 dark:bg-black/90 w-fit h-fit rounded-xl border border-gray-400 dark:border-gray-700">
        <button
          className="text-3xl border-r border-gray-400 dark:border-gray-700 p-2"
          onClick={handlePreviousMonth}
          aria-label="Previous Month"
        >
          <IoCaretBackOutline />
        </button>
        <div className="flex flex-col items-center px-4">
          <div className="text-lg font-semibold">
            {currentMonthName}
          </div>
          {monthCount < 12 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {monthCount} {monthCount === 1 ? 'month' : 'months'} available
            </div>
          )}
        </div>
        <button
          className="text-3xl border-l border-gray-400 dark:border-gray-700 p-2"
          onClick={handleNextMonth}
          aria-label="Next Month"
        >
          <IoCaretForwardOutline />
        </button>
      </div>
    </div>
  );
}

export default memo(MonthNavigate);