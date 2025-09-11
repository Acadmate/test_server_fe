"use client";
import { memo } from "react";

interface MarginProps {
  hoursConducted: number;
  hoursAbsent: number;
  attendance: number;
}

function calculateMarginText(
  hoursConducted: number,
  hoursAbsent: number,
  attendance: number
): JSX.Element | string {
  const remainingClasses = hoursConducted - hoursAbsent;

  if (attendance >= 75) {
    const margin = Math.floor(
      (remainingClasses - 0.75 * hoursConducted) / 0.75
    );
    return (
      <>
        <div className="flex flex-col justify-center items-center">
          <span className="text-[10px]">Margin</span>
          <span className="text-xl">{margin}</span>
        </div>
      </>
    );
  } else {
    const required = Math.ceil(
      (0.75 * hoursConducted - remainingClasses) / 0.25
    );
    return (
      <>
        <div className="flex flex-col justify-center items-center">
          <span className="text-[10px]">Required</span>
          <span className="text-[18px]">{required}</span>
        </div>
      </>
    );
  }
}

function Margin({ hoursConducted, hoursAbsent, attendance }: MarginProps) {
  const marginText = calculateMarginText(
    hoursConducted,
    hoursAbsent,
    attendance
  );
  const isAboveThreshold = attendance >= 75;

  return (
    <div
      className={`flex :text-wrap ${
        isAboveThreshold
          ? "dark:bg-[#394c4a] text-gray-700 dark:text-[#6cf1cd]"
          : "dark:bg-[#4B3939] text-gray-700 dark:text-red-400 border-[#F54B2A]"
      } rounded font-semibold text-xl h-min px-2 py-1`}
    >
      {marginText}
    </div>
  );
}

export default memo(Margin);
