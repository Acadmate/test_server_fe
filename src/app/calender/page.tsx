"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchCalender } from "@/actions/calendarFetch";
import Title from "@/components/shared/title";
import RefreshHeader from "@/components/shared/RefreshHeader";
import PageSkeleton from "@/components/shared/skeleton/PageSkeleton";

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

interface FetchOptions {
  forceRefresh: boolean;
  updateCache: boolean;
}

const MonthNavigate = dynamic(() => import("@/components/calendar/month_navigate"), {
  loading: () => <div className="h-16" /> // Placeholder while loading
});

const MainCal = dynamic(() => import("@/components/calendar/main"), {
  loading: () => <PageSkeleton type="calendar" />
});

export default function Calendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);

  const availableMonths = useMemo(() => {
    if (!calendarData) return [];

    const monthNameToNumber: Record<string, number> = {
      "January": 1, "February": 2, "March": 3, "April": 4,
      "May": 5, "June": 6, "July": 7, "August": 8,
      "September": 9, "October": 10, "November": 11, "December": 12
    };

    return Object.keys(calendarData)
      .map(monthName => monthNameToNumber[monthName])
      .filter((month): month is number => month !== undefined)
      .sort((a, b) => a - b);
  }, [calendarData]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCalendar = await fetchCalender({
        forceRefresh: true,
        updateCache: true
      } as FetchOptions) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedCalendar = await fetchCalender({
        forceRefresh: true,
        updateCache: true
      } as FetchOptions) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
      } else {
        setCalendarData(null);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  if (!calendarData) {
    return (
      <div className="text-center text-lg mt-16">
        <p>Failed to load calendar data. Please try again later.</p>
        <button
          onClick={refresh}
          className="mt-4 bg-green-400 text-black font-semibold p-2 rounded-md active:scale-95 transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

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
        onRefresh={refresh}
        loading={loading}
        className="w-[95vw] lg:w-[72vw] mx-auto"
        additionalInfo={
          availableMonths.length > 0 && (
            <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
              {availableMonths.length}/12 months loaded
            </span>
          )
        }
        zIndex={30}
      />
      <Title />
      <div className={`transition-all duration-300`}>
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