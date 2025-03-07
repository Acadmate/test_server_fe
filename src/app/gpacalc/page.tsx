"use client";
import { useState } from "react";
import GpaCalc from "@/components/Calculator/Calculator";
import CgpaCalc from "@/components/Calculator/CgpaCalc";
import Title from "@/components/shared/title";

export default function CalculatorSelector() {
  const [selectedCalc, setSelectedCalc] = useState<"GPA" | "CGPA">("GPA");

  const getButtonClass = (calcType: "GPA" | "CGPA") => {
    const isSelected = selectedCalc === calcType;
    return `relative z-10 px-6 py-2.5 text-sm font-medium transition-all duration-100 ${
      isSelected
        ? "text-black dark:text-[#C1FF72] font-bold"
        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
    }`;
  };

  const getBlobPosition = () => {
    return selectedCalc === "GPA" ? "translate-x-0" : "translate-x-[92%]";
  };

  return (
    <div className="mx-auto h-fit w-screen lg:w-[70vw] my-4">
      <Title />
      <div className="flex flex-col gap-1 w-full">
        <div className="relative flex flex-row items-center justify-between rounded-full w-fit mx-auto bg-gray-100 dark:bg-gray-800/30 p-1">
          <div
            className={`absolute top-1 left-1 h-[calc(100%-8px)] w-1/2 bg-green-200 dark:bg-[#15241b] rounded-full transition-all duration-300 transform ${getBlobPosition()}`}
          ></div>

          <button
            type="button"
            className={`flex flex-row items-center justify-center w-full text-nowrap ${getButtonClass(
              "GPA"
            )}`}
            onClick={() => setSelectedCalc("GPA")}
          >
            GPA Calc
          </button>
          <button
            type="button"
            className={`flex flex-row items-center justify-center w-full text-nowrap ${getButtonClass(
              "CGPA"
            )}`}
            onClick={() => setSelectedCalc("CGPA")}
          >
            CGPA Calc
          </button>
        </div>

        <div className="mt-4">
          {selectedCalc === "GPA" && <GpaCalc />}
          {selectedCalc === "CGPA" && <CgpaCalc />}
        </div>
      </div>
    </div>
  );
}
