"use client";
import { useState } from "react";
import { BsGraphUp } from "react-icons/bs";
import { BsPersonCheck } from "react-icons/bs";
import { LuTimer } from "react-icons/lu";

export default function AttMarksSwitch() {
  const [select, isSelected] = useState("");
  return (
    <div className="fixed flex flex-row items-center justify-center fixed bottom-6 w-full hidden">
      <div className="fixed p-1 gap-1 bottom-6 items-center justify-center flex flex-row bg-black/90 items-center justify-center w-fit h-fit rounded-xl border-2 border-gray-700">
        <div
          onClick={() => isSelected("time")}
          className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 ${
            select == "time" ? "bg-[#1B3C1E] text-green-500" : "text-gray-400"
          }`}
        >
          <LuTimer />
        </div>
        <div
          onClick={() => isSelected("att")}
          className={`flex flex-row text-xl items-center justify-center rounded-lg w-10 h-10 ${
            select == "att" ? "bg-[#1B3C1E] text-green-500" : "text-gray-400"
          }`}
        >
          <BsPersonCheck />
        </div>
        <div
          onClick={() => isSelected("marks")}
          className={`flex flex-row text-base items-center justify-center rounded-lg w-10 h-10 ${
            select == "marks" ? "bg-[#1B3C1E] text-green-500" : "text-gray-400"
          }`}
        >
          <BsGraphUp />
        </div>
      </div>
    </div>
  );
}
