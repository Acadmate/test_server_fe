"use client";
import { useEffect, useState, useRef } from "react";
import Toggle from "../shared/switchTheme";
import { IoCaretForwardCircle, IoCaretBackCircleSharp } from "react-icons/io5";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Download from "./download";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Animation = dynamic(() => import("@/components/shared/noclass"), {
  ssr: false,
});

interface Course {
  CourseCode: string;
  CourseTitle: string;
  FacultyName: string;
  RoomNo: string;
}

interface PeriodProp {
  period: string;
  timeSlot: string;
  course: Course | null;
}

interface TimetableEntry {
  day: string;
  periods: PeriodProp[];
}

export default function Timetable() {
  const router = useRouter();
  const [order, setOrder] = useState(0);
  const check = parseInt(localStorage.getItem("order") || "0", 10);
  const captureRef = useRef<HTMLDivElement | null>(null);
  const [nowSlot, setnowSlots] = useState(-1);
  const currentSlotRef = useRef<HTMLDivElement | null>(null);
  const now = new Date();

  const [timeTable, setTimeTable] = useState<TimetableEntry[]>([]);

  const currentSlot = (hr: number, min: number) => {
    if (hr === 8 && min < 50) return 0;
    if ((hr === 8 && min >= 50) || (hr === 9 && min < 40)) return 1;
    if ((hr === 9 && min >= 40) || (hr === 10 && min < 35)) return 2;
    if ((hr === 10 && min >= 35) || (hr === 11 && min < 30)) return 3;
    if ((hr === 11 && min >= 30) || (hr === 12 && min < 25)) return 4;
    if ((hr === 12 && min >= 25) || (hr === 13 && min < 20)) return 5;
    if ((hr === 13 && min >= 20) || (hr === 14 && min < 15)) return 6;
    if ((hr === 14 && min >= 15) || (hr === 15 && min < 10)) return 7;
    if ((hr === 15 && min >= 10) || (hr === 16 && min < 0)) return 8;
    if ((hr === 16 && min >= 0) || (hr === 16 && min < 50)) return 9;
    if ((hr === 16 && min >= 50) || hr > 16) return -1;
    return -2;
  };

  useEffect(() => {
    const savedOrder = parseInt(localStorage.getItem("order") || "0", 10);
    const timetableString = localStorage.getItem("timetable");
    const parsedTimetable = timetableString ? JSON.parse(timetableString) : [];
    const hr = now.getHours();
    const min = now.getMinutes();

    setnowSlots(currentSlot(hr, min));
    setOrder(
      savedOrder
    );
    setTimeTable(parsedTimetable);
  }, []);

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [order, router]);

  const captureAsPDF = async () => {
    const element = captureRef.current;
    if (!element) return;
  
    try {
      // Ensure desktop layout is used even on mobile
      const originalDisplay = element.style.display;
      element.style.display = "flex"; // Ensure it's not hidden
  
      // Detect current theme
      const isDarkMode = document.documentElement.classList.contains("dark");
  
      // Apply theme to ensure correct colors are captured
      if (isDarkMode) {
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
      }
  
      // Capture the element as an image
      const canvas = await html2canvas(element, {
        scale: 2, // Increase resolution
        useCORS: true,
        backgroundColor: isDarkMode ? "#000" : "#fff",
      });
  
      // Restore original display
      element.style.display = originalDisplay;
  
      // Convert canvas to image
      const imgData = canvas.toDataURL("image/png");
  
      // Match the width of the timetable in the PDF
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;
  
      // Create a PDF with the same width as the captured table
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "l" : "p",
        unit: "px",
        format: [imgWidth, imgHeight],
      });
  
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("TimeTable.pdf");
  
    } catch (error) {
      console.error("Error capturing timetable as PDF:", error);
    }
  };

  function downloadPDF() {
    const originalWidth = document.body.style.width;
    document.body.style.width = "1440px"; // Force desktop width
  
    // Ensure styles are applied before rendering PDF
    setTimeout(() => {
      captureAsPDF();
      document.body.style.width = originalWidth; // Restore original width after download
    }, 100); // Small delay to apply styles
  }
  
  
  return (
    <>
      {check !== 0 ? (
        <div className="h-[175vh] lg:h-[90vh]">
          <div className="flex flex-row w-full lg:w-[74vw] justify-between my-2 px-8">
            <div className="flex flex-row gap-4">
              <h1 className="text-2xl font-bold">Time Table</h1>
              <span className="hidden lg:block">
                <Download func={captureAsPDF} />
              </span>
            </div>
            <Toggle />
          </div>

          {/* Mobile View */}
          <div className="w-full border-box px-2 h-[150vh] lg:hidden">
            {timeTable[order - 1] ? (
              <div className="flex flex-col gap-1 justify-center">
                <div className="flex flex-row justify-between items-center">
                  <div className="flex flex-row font-bold text-xl mx-3 my-1 px-3 w-fit text-black rounded bg-green-300/40 dark:bg-[#15241b] dark:text-[#C1FF72]">
                    {timeTable[order - 1].day}
                  </div>
                  <div>
                    <Download func={downloadPDF} />
                  </div>
                </div>
                {timeTable[order - 1].periods
                  .slice(0, -2)
                  .map((period, periodIndex) => (
                    <div
                      key={periodIndex}
                      ref={periodIndex === nowSlot ? currentSlotRef : null}
                      className={`flex flex-row rounded py-1 px-2 w-full text-lg md:text-xl font-bold gap-2 ${
                        periodIndex === nowSlot
                          ? "border-2 border-[#C1FF72] border-dashed"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center w-[70px] bg-gray-100 md:w-[20vw] md:h-[8vh] text-center text-base md:text-lg dark:bg-black rounded-[20px] p-2">
                        {period.timeSlot}
                      </div>
                      <div
                        className={`flex flex-row ${
                          period.period.includes("P") && period.course
                            ? "bg-green-300/40 dark:bg-[#15241b] dark:text-[#C1FF72]"
                            : !period.period.includes("P") && period.course
                            ? "bg-orange-300/40 dark:bg-[#2e2a14] dark:text-[#FFDD70]"
                            : "bg-gray-100 dark:bg-black text-gray-900 dark:text-white"
                        } w-full rounded-[20px] items-center justify-center text-center`}
                      >
                        {period.course?.CourseTitle || ""}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No timetable data available.</p>
            )}
          </div>

          {/* Desktop View */}
          <div ref={captureRef} className="hidden lg:flex flex-col">
            {timeTable[order - 1] ? (
              <div className="flex flex-col">
                <div className="flex flex-row justify-end gap-[15px]">
                  {timeTable[order - 1].periods.slice(0, -2).map((period) => (
                    <div
                      key={period.timeSlot}
                      className="flex flex-col items-center justify-center w-[6vw] bg-gray-100 text-center text-xs dark:bg-black rounded-[12px] py-2 px-1"
                    >
                      {period.timeSlot}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  {timeTable.map((item) => (
                    <div
                      key={item.day}
                      className="flex flex-row justify-between w-full my-1"
                    >
                      <div className="flex flex-col text-nowrap w-[50px] p-1 text-lg font-extrabold items-center justify-center">
                        {item.day}
                      </div>
                      {item.periods.slice(0, -2).map((period) => (
                        <div
                          key={period.period}
                          className={`flex flex-row w-[6vw] ${
                            period.period.includes("P") && period.course
                              ? "bg-green-300/40 dark:bg-[#15241b] dark:text-[#C1FF72]"
                              : !period.period.includes("P") && period.course
                              ? "bg-orange-300/40 dark:bg-[#2e2a14] dark:text-[#FFDD70]"
                              : "bg-gray-100 dark:bg-black text-gray-900 dark:text-white"
                          } rounded-[12px] items-center justify-center text-center text-xs p-2`}
                        >
                          {period.course?.CourseTitle
                            ? period.course?.CourseTitle.length > 30
                              ? `${period.course?.CourseTitle.slice(0, 30)}...`
                              : period.course.CourseTitle
                            : ""}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p>No timetable data available.</p>
            )}
          </div>

          <div className="lg:hidden fixed flex flex-row items-center justify-between gap-2 p-2 font-bold bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-500/70 dark:bg-black/70 backdrop-blur-sm text-white font-bold rounded-full shadow-lg">
            <div
              className="p-1 rounded bg-green-400 dark:text-black active:scale-95 duration-400 transition-all"
              onClick={() =>
                setOrder(parseInt(localStorage.getItem("order") || "1", 10))
              }
            >
              Today
            </div>
            <div
              className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
              onClick={() =>
                setOrder((prev) => (prev === 1 ? timeTable.length : prev - 1))
              }
            >
              <IoCaretBackCircleSharp />
            </div>
            <div className="flex flex-row items-center justify-center text-nowrap w-[60px]">
              {timeTable[order - 1]?.day || "No Data"}
            </div>
            <div
              className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
              onClick={() =>
                setOrder((prev) => (prev === timeTable.length ? 1 : prev + 1))
              }
            >
              <IoCaretForwardCircle />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-[85vh] my-5">
          <div>
            <Animation />
          </div>
          <div className="text-3xl dark:text-green-400 font-extrabold">
            No classes today...
          </div>
        </div>
      )}
    </>
  );
}
