import { IoCaretForwardOutline, IoCaretBackOutline } from "react-icons/io5";
import useMonth from "@/store/calendarMonth";

const monthMap = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
} as const;

export default function MonthNavigate() {
  const { month, setMonth } = useMonth();

  const handlePreviousMonth = () => {
    setMonth(month > 1 ? month - 1 : 6);
  };

  const handleNextMonth = () => {
    setMonth(month < 6 ? month + 1 : 1);
  };

  return (
    <div className="fixed flex flex-row items-center justify-center bottom-6 w-full z-40">
      <div className="p-1 gap-1 items-center justify-center flex flex-row bg-gray-100 dark:bg-black/90 w-fit h-fit rounded-xl border border-gray-400 dark:border-gray-700">
        <button
          className="text-3xl border-r border-gray-400 dark:border-gray-700 p-2"
          onClick={handlePreviousMonth}
          aria-label="Previous Month"
        >
          <IoCaretBackOutline />
        </button>
        <div className="px-4 text-lg font-semibold">
          {monthMap[month as keyof typeof monthMap]}
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
