// import { RiErrorWarningFill } from "react-icons/ri";
"use client";
interface Marginprops {
  hoursConducted: number;
  hoursAbsent: number;
  attendance: number;
}

export default function Margin({
  hoursConducted,
  hoursAbsent,
  attendance,
}: Marginprops) {
  const remainingClasses = hoursConducted - hoursAbsent;
  return (
    <div
      className={`flex text-sm md:text-nowrap ${
        attendance >= 75
          ? "dark:bg-[#1B3C1E] text-gray-700 dark:text-green-500"
          : "text-gray-700 dark:text-red-400 border-[#F54B2A]"
      } rounded-full font-bold h-fit px-2 py-1`}
    >
      {attendance >= 75
        ? `Margin: ${Math.floor(
            (remainingClasses - 0.75 * hoursConducted) / 0.75
          )}`
        : `Required: ${Math.ceil(
            (0.75 * hoursConducted - remainingClasses) / 0.25
          )}`}
    </div>
  );
}
