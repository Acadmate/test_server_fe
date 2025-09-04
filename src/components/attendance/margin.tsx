"use client";
import { memo } from "react";

interface MarginProps {
  hoursConducted: number;
  hoursAbsent: number;
  attendance: number;
}

// Precalculate the margin or required classes to avoid recalculation on every render
function calculateMarginText(hoursConducted: number, hoursAbsent: number, attendance: number): string {
  const remainingClasses = hoursConducted - hoursAbsent;
  
  if (attendance >= 75) {
    const margin = Math.floor((remainingClasses - 0.75 * hoursConducted) / 0.75);
    return `Margin: ${margin}`;
  } else {
    const required = Math.ceil((0.75 * hoursConducted - remainingClasses) / 0.25);
    return `Required: ${required}`;
  }
}

function Margin({ hoursConducted, hoursAbsent, attendance }: MarginProps) {
  const marginText = calculateMarginText(hoursConducted, hoursAbsent, attendance);
  const isAboveThreshold = attendance >= 75;
  
  return (
    <div
      className={`flex text-sm md:text-nowrap ${
        isAboveThreshold
          ? "dark:bg-[#1B3C1E] text-gray-700 dark:text-green-500"
          : "text-gray-700 dark:text-red-400 border-[#F54B2A]"
      } rounded-full font-bold h-fit px-2 py-1`}
    >
      {marginText}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(Margin);