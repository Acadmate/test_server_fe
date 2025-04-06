"use client";
import { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef } from "react";
import dynamic from "next/dynamic";
import { fetchDetails, getTimetableCacheStats } from "@/actions/details";
import { fetchOrder } from "@/actions/orderFetch";
import { TbRefresh } from "react-icons/tb";
import { IoCaretForwardCircle, IoCaretBackCircleSharp } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentTimeSlot } from "../../components/hooks/useCurrentTimeSlot";
import { LoadingSkeleton } from "../../components/timetable/loadingSkilition";
import { updateCacheTimestamp } from "../../components/utils/cacheUtils";

const Toggle = dynamic(() => import("../../components/shared/switchTheme"), { ssr: false });
const Animation = dynamic(() => import("@/components/shared/noclass"), { ssr: false });
const Download = lazy(() => import("../../components/timetable/download"));

export default function TimetablePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  interface Period {
    timeSlot: string;
    period: string;
    course?: {
      CourseTitle: string;
    };
  }

  interface Timetable {
    day: string;
    periods: Period[];
  }

  const [timeTable, setTimeTable] = useState<Timetable[]>([]);
  const [order, setOrder] = useState(1);
  const [click, setClick] = useState(0);
  const [check, setCheck] = useState("on"); // Default value without localStorage
  
  interface CacheStats {
    exists: boolean;
    timestamp?: string;
    isExpired?: boolean;
    expiresIn?: number;
  }

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const currentSlotRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const currentSlot = useCurrentTimeSlot();

  // Initialize client-side only variables
  useEffect(() => {
    // Only access localStorage on the client side
    setCheck(localStorage.getItem("order") || "on");
  }, []);

  const updateCacheStats = useCallback(() => {
    const stats = getTimetableCacheStats();
    setCacheStats(stats);
    return stats;
  }, []);

  const refreshTimetable = useCallback(async () => {
    setLoading(true);
    try {
      const timetableData = await fetchDetails({ forceRefresh: true });
      if (timetableData) {
        setTimeTable(timetableData);
        fetchOrder({ forceRefresh: true }).catch(err => console.error("Error fetching order:", err));
        updateCacheTimestamp("timetable");
        updateCacheStats();
      } else {
        throw new Error("Failed to fetch timetable");
      }
    } catch (error) {
      console.error("Error refreshing timetable:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [updateCacheStats]);

  const initializeData = useCallback(async () => {
    setLoading(true);
    try {
      const stats = updateCacheStats();
      const timetableData = await fetchDetails({
        forceRefresh: !stats.exists || stats.isExpired
      });

      if (timetableData) {
        setTimeTable(timetableData);
        updateCacheTimestamp("timetable");
        updateCacheStats();

        // Move localStorage access to client-side only
        if (typeof window !== 'undefined') {
          const rawOrder = localStorage.getItem("order");
          const savedOrder = rawOrder && !isNaN(Number(rawOrder)) ? Number(rawOrder) : 1;
          setOrder(savedOrder > 0 && savedOrder <= timetableData.length ? savedOrder : 1);
        }
      } else {
        throw new Error("Failed to fetch timetable");
      }
    } catch (error) {
      console.error("Error initializing timetable data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [updateCacheStats]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    fetchOrder().catch(err => console.error("Error fetching order:", err));
  }, []);

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [order]);

  const captureAsPDF = useCallback(async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const element = captureRef.current;
    if (!element) return;

    try {
      const originalDisplay = element.style.display;
      element.style.display = "flex";
      const isDarkMode = document.documentElement.classList.contains("dark");
      if (isDarkMode) {
        element.classList.add("dark");
      } else {
        element.classList.remove("dark");
      }
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: isDarkMode ? "#000" : "#fff",
      });
      element.style.display = originalDisplay;
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width / 3;
      const imgHeight = canvas.height / 3;
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
  }, []);

  const downloadPDF = useCallback(() => {
    const originalWidth = document.body.style.width;
    document.body.style.width = "1440px";
    setTimeout(() => {
      captureAsPDF();
      document.body.style.width = originalWidth;
    }, 100);
  }, [captureAsPDF]);

  const blurPulseStyle = loading
    ? {
      animation: "blurPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)",
      filter: "blur(0.5px)",
      opacity: 0.8,
      willChange: "filter, opacity",
    }
    : {};

  // Memoize current day's timetable to prevent unnecessary re-renders
  const currentDayTimetable = useMemo(() => {
    return timeTable[order - 1] || null;
  }, [timeTable, order]);

  // Make sure we have client-side rendering before showing localStorage-dependent content
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  return (
    check === "off" && click === 0 ? (
      <div className="flex flex-col items-center justify-center w-full h-[85vh] my-5 gap-4">
        <Animation />
        <div className="text-3xl dark:text-green-400 font-extrabold">
          No classes today...
        </div>
        <div className="absolute bottom-10 flex flex-row items-center justify-between gap-2 p-2 font-bold bg-gray-500/70 dark:bg-black/70 backdrop-blur-sm text-white font-bold rounded-full shadow-lg">
          <div
            className="p-1 rounded bg-green-400 dark:text-black active:scale-95 duration-400 transition-all"
            onClick={() => {
              setClick(0);
              const storedOrder = localStorage.getItem("order");
              setOrder(parseInt(storedOrder || "1", 10));
            }}
          >
            Today
          </div>
          <div
            className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
            onClick={() => {
              setClick(1);
              setOrder((prev) => (prev === 1 ? timeTable.length : prev - 1));
            }}
          >
            <IoCaretBackCircleSharp />
          </div>
          <div className="flex flex-row items-center justify-center text-nowrap w-[60px]">
            See Next
          </div>
          <div
            className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
            onClick={() => {
              setClick(1);
              setOrder((prev) => (prev === timeTable.length ? 1 : prev + 1));
            }}
          >
            <IoCaretForwardCircle />
          </div>
        </div>
      </div>)
      : (
        <div className="flex flex-col justify-center items-center mx-auto h-fit w-screen lg:w-[73vw]">
          <style jsx global>{`
        @keyframes blurPulse {
          0% {
            filter: blur(0.5px);
            opacity: 0.5;
          }
          50% {
            filter: blur(2px);
            opacity: 0.7;
          }
          100% {
            filter: blur(0.5px);
            opacity: 0.5;
          }
        }
        `}</style>

          <div className="z-40 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
            <div className="flex items-center justify-between">
              <span className="flex flex-col text-xs sm:text-base">
                Data outdated? Click to refresh.
                <span className="text-green-400 font-bold">
                  Last fetched:{" "}
                  {cacheStats?.exists ? cacheStats.timestamp : "-"}
                  {cacheStats?.exists && (cacheStats.expiresIn ?? 0) > 0 && (
                    <span className="ml-1 text-xs">
                      (expires in {cacheStats.expiresIn} min)
                    </span>
                  )}
                </span>
              </span>
              <button
                onClick={refreshTimetable}
                disabled={loading}
                className="bg-green-400 text-black font-extrabold p-1 rounded-md text-xl sm:py-2 sm:px-4 sm:text-base active:scale-95 transition-all duration-300"
              >
                <TbRefresh className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="flex flex-row w-full lg:w-[74vw] justify-between my-2 px-8">
            <div className="flex flex-row gap-4">
              <h1 className="text-2xl font-bold">Time Table</h1>
              <span className="hidden lg:block">
                <Suspense fallback={<Skeleton className="h-8 w-32" />}>
                  <Download func={captureAsPDF} />
                </Suspense>
              </span>
            </div>
            <Toggle />
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="h-screen w-screen flex items-center justify-center">
              {currentDayTimetable?.day || "No Data"}
            </div>
          ) : (
            <>
              {/* Mobile View */}
              <div
                className="w-full border-box px-2 h-[150vh] lg:hidden"
                style={blurPulseStyle}
              >
                {currentDayTimetable ? (
                  <div className="flex flex-col gap-1 justify-center">
                    <div className="flex flex-row justify-between items-center">
                      <div className="flex flex-row font-bold text-xl mx-3 my-1 px-3 w-fit text-black rounded bg-green-300/40 dark:bg-[#15241b] dark:text-[#C1FF72]">
                        {currentDayTimetable.day}
                      </div>
                      <div>
                        <Suspense fallback={<Skeleton className="h-8 w-32" />}>
                          <Download func={downloadPDF} />
                        </Suspense>
                      </div>
                    </div>
                    {currentDayTimetable.periods
                      .slice(0, -2)
                      .map((period, periodIndex) => (
                        <div
                          key={periodIndex}
                          ref={periodIndex === currentSlot ? currentSlotRef : null}
                          className={`flex flex-row rounded py-1 px-2 w-full text-lg md:text-xl font-bold gap-2 ${periodIndex === currentSlot
                            ? "border-2 border-[#C1FF72] border-dashed"
                            : ""
                            }`}
                        >
                          <div className="flex flex-col items-center justify-center w-[70px] bg-gray-100 md:w-[20vw] md:h-[8vh] text-center text-base md:text-lg dark:bg-black rounded-[20px] p-2">
                            {period.timeSlot}
                          </div>
                          <div
                            className={`flex flex-row ${period.period.includes("P") && period.course
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
              <div
                ref={captureRef}
                className="hidden lg:flex flex-col"
                style={blurPulseStyle}
              >
                {currentDayTimetable ? (
                  <div className="flex flex-col">
                    <div className="flex flex-row justify-end gap-[15px]">
                      {currentDayTimetable.periods.slice(0, -2).map((period) => (
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
                          {item.periods.slice(0, -2).map((period, periodIndex) => (
                            <div
                              key={`${item.day}-${period.period}-${periodIndex}`}
                              className={`flex flex-row w-[6vw] ${period.period.includes("P") && period.course
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
                  onClick={() => {
                    const storedOrder = localStorage.getItem("order");
                    setOrder(parseInt(storedOrder || "1", 10));
                  }}
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
                  {currentDayTimetable?.day || "No Data"}
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
            </>
          )}
        </div>
      )
  );
}