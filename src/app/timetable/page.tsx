"use client";
import { useState, useEffect, useCallback, useMemo, Suspense, lazy, useRef } from "react";
import dynamic from "next/dynamic";
import { fetchTimetable, getTimetableCacheStats } from "@/actions/timetableFetch";
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

interface Period {
  timeSlot: string;
  period: string;
  course?: { CourseTitle: string };
}

interface Timetable {
  day: string;
  periods: Period[];
}

interface CacheStats {
  exists: boolean;
  timestamp?: string;
  isExpired?: boolean;
  expiresIn?: number;
}

// Utils
function toInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function clampOrder(order: number, len: number): number {
  if (len <= 0) return 1;
  if (!Number.isFinite(order) || order < 1) return 1;
  if (order > len) return len;
  return order;
}

function orderToIndex(order: number, len: number): number {
  const clamped = clampOrder(order, len);
  return Math.max(0, Math.min(len - 1, clamped - 1));
}

function readStoredOrder(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("order");
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export default function TimetablePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [timeTable, setTimeTable] = useState<Timetable[]>([]);
  // Use 1-based order in state for UI navigation, consistent everywhere
  const [order, setOrder] = useState<number>(1);
  const [isHoliday, setIsHoliday] = useState<boolean>(false);

  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const currentSlotRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const currentSlot = useCurrentTimeSlot();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const updateCacheStatsMemo = useCallback(() => {
    const stats = getTimetableCacheStats();
    setCacheStats(stats);
    return stats;
  }, []);

  const safeSetOrderFromValue = useCallback((value: number | "off" | null, len: number) => {
    if (value === "off") {
      setIsHoliday(true);
      // Keep a stable order value for navigation; default to 1
      setOrder(1);
      return;
    }
    setIsHoliday(false);
    const numeric = toInt(value, 1);
    setOrder(clampOrder(numeric, len));
  }, []);

  const initializeData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const stats = updateCacheStatsMemo();

      // 1) Timetable first (so we know length bounds for order)
      const timetableData = await fetchTimetable({
        forceRefresh: !stats.exists || stats.isExpired,
      });

      if (!timetableData || !Array.isArray(timetableData)) {
        throw new Error("Failed to fetch timetable or invalid data format");
      }

      setTimeTable(timetableData);
      updateCacheTimestamp("timetable");
      updateCacheStatsMemo();

      // 2) Now fetch order and set it safely (await to avoid flicker)
      const fetchedOrder = await fetchOrder({ forceRefresh: false });
      // If fetchOrder returns null (no data), use last stored or default
      const stored = readStoredOrder();
      const value = fetchedOrder ?? stored ?? 1;
      safeSetOrderFromValue(value, timetableData.length);

    } catch (err) {
      console.error("Error initializing timetable data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [updateCacheStatsMemo, safeSetOrderFromValue]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Avoid a separate fetchOrder here to prevent race/flicker; initializeData awaited it.

  useEffect(() => {
    if (currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [order, currentSlot]);

  const captureAsPDF = useCallback(async () => {
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

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

  const currentDayTimetable = useMemo(() => {
    if (!timeTable || timeTable.length === 0) return null;
    const idx = orderToIndex(order, timeTable.length); // Safe and 0-based
    return timeTable[idx] || null;
  }, [timeTable, order]);

  if (!isClient) {
    return <LoadingSkeleton />;
  }

  // Holiday view: show "No classes today" when isHoliday is true
  if (isHoliday) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[85vh] my-5 gap-4">
        <Animation />
        <div className="text-3xl dark:text-green-400 font-extrabold">No classes today...</div>
        <div className="absolute bottom-10 flex flex-row items-center justify-between gap-2 p-2 font-bold bg-gray-500/70 dark:bg-black/70 backdrop-blur-sm text-white rounded-full shadow-lg">
          <div
            className="p-1 rounded bg-green-400 dark:text-black active:scale-95 duration-400 transition-all"
            onClick={async () => {
              // Re-sync order if user presses Today
              const o = (await fetchOrder({ forceRefresh: false })) ?? readStoredOrder() ?? 1;
              setIsHoliday(o === "off");
              if (o !== "off") {
                setOrder(prev => clampOrder(toInt(o, prev), timeTable.length));
              }
            }}
          >
            Today
          </div>
          <div
            className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
            onClick={() => {
              setIsHoliday(false); // Navigate to previous day grid
              setOrder(prev => (prev === 1 ? timeTable.length : prev - 1));
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
              setIsHoliday(false);
              setOrder(prev => (prev === timeTable.length ? 1 : prev + 1));
            }}
          >
            <IoCaretForwardCircle />
          </div>
        </div>
      </div>
    );
  }

  return (
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
              Last fetched: {cacheStats?.exists ? cacheStats.timestamp : "-"}
              {cacheStats?.exists && (cacheStats.expiresIn ?? 0) > 0 && (
                <span className="ml-1 text-xs">(expires in {cacheStats.expiresIn} min)</span>
              )}
            </span>
          </span>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const timetableData = await fetchTimetable({ forceRefresh: true });
                if (timetableData && Array.isArray(timetableData)) {
                  setTimeTable(timetableData);
                  // Re-fetch order to keep in sync
                  const o = await fetchOrder({ forceRefresh: true });
                  const fallback = readStoredOrder();
                  const val = o ?? fallback ?? 1;
                  safeSetOrderFromValue(val, timetableData.length);

                  updateCacheTimestamp("timetable");
                  updateCacheStatsMemo();
                } else {
                  throw new Error("Failed to fetch timetable or invalid data format");
                }
              } catch (e) {
                console.error("Error refreshing timetable:", e);
                setError(true);
              } finally {
                setLoading(false);
              }
            }}
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
              <Download func={downloadPDF} />
            </Suspense>
          </span>
        </div>
        <Toggle />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-500 mb-4">Failed to load timetable</p>
            <button
              onClick={initializeData}
              className="bg-green-400 text-black px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="w-full border-box px-2 h-[150vh] lg:hidden" style={blurPulseStyle}>
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
                {currentDayTimetable.periods.slice(0, -2).map((period, periodIndex) => (
                  <div
                    key={`${period.timeSlot}-${periodIndex}`}
                    ref={periodIndex === currentSlot ? currentSlotRef : null}
                    className={`flex flex-row rounded py-1 px-2 w-full text-lg md:text-xl font-bold gap-2 ${
                      periodIndex === currentSlot ? "border-2 border-[#C1FF72] border-dashed" : ""
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
              <div className="text-center p-8">
                <p className="text-xl mb-4">No timetable data available</p>
                <p className="text-gray-500">TimeTable length: {timeTable.length}</p>
                <p className="text-gray-500">Current order: {order}</p>
              </div>
            )}
          </div>

          {/* Desktop View */}
          <div ref={captureRef} className="hidden lg:flex flex-col" style={blurPulseStyle}>
            {currentDayTimetable && timeTable.length > 0 ? (
              <div className="flex flex-col">
                <div className="flex flex-row justify-end gap-[15px]">
                  {currentDayTimetable.periods.slice(0, -2).map((period, i) => (
                    <div
                      key={`${period.timeSlot}-${i}`}
                      className="flex flex-col items-center justify-center w-[6vw] bg-gray-100 text-center text-xs dark:bg-black rounded-[12px] py-2 px-1"
                    >
                      {period.timeSlot}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  {timeTable.map((item, rowIdx) => (
                    <div key={`${item.day}-${rowIdx}`} className="flex flex-row justify-between w-full my-1">
                      <div className="flex flex-col text-nowrap w-[50px] p-1 text-lg font-extrabold items-center justify-center">
                        {item.day}
                      </div>
                      {item.periods.slice(0, -2).map((period, periodIndex) => (
                        <div
                          key={`${item.day}-${period.period}-${periodIndex}`}
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
              <div className="text-center p-8">
                <p className="text-xl mb-4">No timetable data available</p>
                <p className="text-gray-500">TimeTable length: {timeTable.length}</p>
                <p className="text-gray-500">Current order: {order}</p>
              </div>
            )}
          </div>

          <div className="lg:hidden fixed flex flex-row items-center justify-between gap-2 p-2 font-bold bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-500/70 dark:bg-black/70 backdrop-blur-sm text-white rounded-full shadow-lg">
            <div
              className="p-1 rounded bg-green-400 dark:text-black active:scale-95 duration-400 transition-all"
              onClick={async () => {
                const o = (await fetchOrder({ forceRefresh: false })) ?? readStoredOrder() ?? 1;
                setIsHoliday(o === "off");
                if (o !== "off") setOrder(prev => clampOrder(toInt(o, prev), timeTable.length));
              }}
            >
              Today
            </div>
            <div
              className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
              onClick={() => setOrder(prev => (prev === 1 ? timeTable.length : prev - 1))}
            >
              <IoCaretBackCircleSharp />
            </div>
            <div className="flex flex-row items-center justify-center text-nowrap w-[60px]">
              {currentDayTimetable?.day || "No Data"}
            </div>
            <div
              className="text-black dark:text-green-400 text-[35px] active:scale-95 duration-400 transition-all rounded-3xl border-2 border-black dark:border-white"
              onClick={() => setOrder(prev => (prev === timeTable.length ? 1 : prev + 1))}
            >
              <IoCaretForwardCircle />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
