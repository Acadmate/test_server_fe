"use client";
import { useState } from "react";
import { BsGraphUp } from "react-icons/bs";
import { BsPersonCheck } from "react-icons/bs";
import { MdOutlineDashboard } from "react-icons/md";
import useScrollMrks from "@/store/mrksScroll";

export default function AttMarksSwitch() {
  const { setSection } = useScrollMrks();
  const [select, isSelected] = useState("");
  return (
    <div className="fixed flex flex-row items-center justify-center fixed bottom-6 w-full md:hidden">
      <div className="fixed p-1 gap-1 bottom-6 items-center justify-center flex flex-row bg-gray-100 dark:bg-black/90 items-center justify-center w-fit h-fit rounded-xl border border-gray-400 dark:border-gray-700">
        <div
          onClick={() => {
            isSelected("dashboard");
            setSection("dashboard");
          }}
          className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 ${
            select == "dashboard"
              ? "bg-[#1B3C1E] text-green-500"
              : "text-black dark:text-gray-400"
          }`}
        >
          <MdOutlineDashboard />
        </div>
        <div className="border-[0.5px] h-8 border-gray-400 dark:border-gray-700 rounded"></div>
        <div
          onClick={() => {
            isSelected("attendance");
            setSection("attendance");
          }}
          className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 ${
            select == "attendance"
              ? "bg-[#1B3C1E] text-green-500"
              : "text-black dark:text-gray-400"
          }`}
        >
          <BsPersonCheck />
        </div>
        <div className="border-[0.5px] h-8 border-gray-400 dark:border-gray-700 rounded"></div>
        <div
          onClick={() => {
            isSelected("marks");
            setSection("marks");
          }}
          className={`flex flex-row text-base items-center justify-center rounded-lg w-10 h-10 ${
            select == "marks"
              ? "bg-[#1B3C1E] text-green-500"
              : "text-black dark:text-gray-400"
          }`}
        >
          <BsGraphUp />
        </div>
      </div>
    </div>
  );
}
