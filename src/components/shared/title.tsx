"use client";
import Toggle from "./switchTheme";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CalendarPredict from "./calenderPredict";
import usePredictedButton from "@/store/predictButtonState";

export default function Title() {
  const { predictedButton } = usePredictedButton();
  const [path, setPath] = useState("/");
  const pathname = usePathname();
  function calc() {
    if (pathname == "/calender") {
      return "Calendar";
    } else if (pathname == "/timetable") {
      return "Timetable";
    } else if (pathname == "/attendance") {
      return predictedButton == 1 ? "Predicted Att %" : "Attendance";
    } else if (pathname == "/gpacalc") {
      return "Gpa Calc";
    } else if (pathname == "/messmenu") {
      return "Mess Menu";
    } else if (pathname == "/logs") {
      return "Logs";
    } else {
      return "Imp Links";
    }
  }

  useEffect(() => {
    setPath(calc());
  }, [pathname, predictedButton]);

  return (
    <div className="flex flex-row w-full justify-between items-center my-2 px-4">
      <div className={`flex flex-row items-center gap-3 w-fit h-fit`}>
        <h1 className="text-2xl font-bold">{path}</h1>
        {pathname == "/attendance" ? <CalendarPredict /> : ""}
      </div>
      <Toggle />
    </div>
  );
}
