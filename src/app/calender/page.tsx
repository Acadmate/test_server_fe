"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchCalender } from "@/actions/calendarFetch";
import Title from "@/components/shared/title";
import RefreshHeader from "@/components/shared/RefreshHeader";
import PageSkeleton from "@/components/shared/skeleton/PageSkeleton";
import {
  formatLastFetchedText,
  setLastFetchedTime,
} from "@/lib/lastFetchedUtils";

interface CalendarEvent {
  title: string;
  date: string;
  description?: string;
}

interface CalendarMonth {
  [day: number]: CalendarEvent[];
}

interface CalendarData {
  [month: string]: CalendarMonth;
}

const MonthNavigate = dynamic(
  () => import("@/components/calendar/month_navigate"),
  {
    loading: () => <div className="h-16" />,
  }
);

const MainCal = dynamic(() => import("@/components/calendar/main"), {
  loading: () => <PageSkeleton type="calendar" />,
});

export default function Calendar() {
  const [isInitializing, setIsInitializing] = useState(true); // For the initial full-page skeleton
  const [isRefreshing, setIsRefreshing] = useState(false); // For the refresh button spinner & blur effect
  const [error, setError] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const availableMonths = useMemo(() => {
    if (!calendarData) return [];

    const monthNameToNumber: Record<string, number> = {
      January: 1,
      February: 2,
      March: 3,
      April: 4,
      May: 5,
      June: 6,
      July: 7,
      August: 8,
      September: 9,
      October: 10,
      November: 11,
      December: 12,
    };

    return Object.keys(calendarData)
      .map((monthName) => monthNameToNumber[monthName])
      .filter((month): month is number => month !== undefined)
      .sort((a, b) => a - b);
  }, [calendarData]);

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    setError(false);
    try {
      const data = await fetchCalender({
        forceRefresh: true,
        updateCache: true,
      });
      if (data) {
        setCalendarData(data);
        setLastFetchedTime("calendar");
      } else {
        throw new Error("Failed to fetch calendar data");
      }
    } catch (e) {
      console.error("Error refreshing calendar data:", e);
      setError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const initializeData = useCallback(async () => {
    setIsInitializing(true);
    setError(false);
    try {
      const data = await fetchCalender({ forceRefresh: false });
      if (data) {
        setCalendarData(data);
        setLastFetchedTime("calendar");
      } else {
        throw new Error("Failed to fetch calendar or invalid data format");
      }
    } catch (err) {
      console.error("Error initializing calendar data:", err);
      setError(true);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (!isClient) {
    return (
      <div className="flex flex-col gap-2 w-fit mx-auto">
        <div className="h-16" />
        <div className="w-[95vw] lg:w-[72vw] mx-auto h-16" />
        <div className="h-12" />
        <PageSkeleton type="calendar" />
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col gap-2 w-fit mx-auto">
        <div className="h-16" />
        <div className="w-[95vw] lg:w-[72vw] mx-auto h-16" />
        <div className="h-12" />
        <PageSkeleton type="calendar" />
      </div>
    );
  }

  // Error state
  if (error || !calendarData) {
    return (
      <div className="text-center text-lg mt-16">
        <p>Failed to load calendar data. Please try again later.</p>
        <button
          onClick={refreshData}
          className="mt-4 bg-green-400 text-black font-semibold p-2 rounded-md active:scale-95 transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex flex-col gap-2 w-fit mx-auto">
      <style jsx global>{`
        @keyframes blur-pulse {
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
        .animate-blur-pulse {
          animation: blur-pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
          filter: blur(0.5px);
          opacity: 0.8;
          will-change: filter, opacity;
        }
      `}</style>

      <MonthNavigate
        availableMonths={availableMonths}
        calendarData={calendarData}
      />

      <RefreshHeader
        onRefresh={refreshData}
        loading={isRefreshing}
        className="w-[95vw] lg:w-[72vw] mx-auto"
        additionalInfo={formatLastFetchedText("calendar")}
        zIndex={30}
      />
      <Title />
      <div
        className={`transition-all duration-300 ${
          isRefreshing ? "animate-blur-pulse" : ""
        }`}
      >
        <MainCal
          data={Object.fromEntries(
            Object.entries(calendarData).map(([month, days]) => [
              month,
              Object.values(days).flat(),
            ])
          )}
        />
      </div>
    </div>
  );
}
