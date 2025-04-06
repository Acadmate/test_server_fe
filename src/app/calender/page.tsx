"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import { fetchCalender, getCalendarCacheStats } from "@/actions/calendarFetch";
import Title from "@/components/shared/title";
import { TbRefresh } from "react-icons/tb";
import { Skeleton } from "@/components/ui/skeleton";

// Define proper types for our calendar data
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

// Define cache stats interface
interface CacheStats {
  exists: boolean;
  timestamp: string;
  isExpired: boolean;
  expiresIn: number; // minutes
}

// Define fetch options interface
interface FetchOptions {
  forceRefresh: boolean;
  updateCache: boolean;
}

// Lazy load components
const MonthNavigate = dynamic(() => import("@/components/calendar/month_navigate"), {
  loading: () => <div className="h-16" /> // Placeholder while loading
});

const MainCal = dynamic(() => import("@/components/calendar/main"), {
  loading: () =>
    <div className="w-full flex flex-col items-center justify-center p-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-[125px] w-full rounded-xl mt-2" />
      ))}
    </div>
});

export default function Calendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

  // Memoized function to update cache stats
  const updateCacheStats = useCallback(() => {
    const stats = getCalendarCacheStats() as CacheStats;
    setCacheStats(stats);
    return stats;
  }, []);

  // Get available months from calendar data
  const availableMonths = useMemo(() => {
    if (!calendarData) return [];

    // Map month names to their corresponding numbers
    const monthNameToNumber: Record<string, number> = {
      "January": 1, "February": 2, "March": 3, "April": 4,
      "May": 5, "June": 6, "July": 7, "August": 8,
      "September": 9, "October": 10, "November": 11, "December": 12
    };

    // Extract available months from the data
    return Object.keys(calendarData)
      .map(monthName => monthNameToNumber[monthName])
      .filter((month): month is number => month !== undefined)
      .sort((a, b) => a - b);
  }, [calendarData]);

  // Memoized refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Force a fresh fetch and update the cache
      const fetchedCalendar = await fetchCalender({
        forceRefresh: true,
        updateCache: true
      } as FetchOptions) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
        updateCacheStats();
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [updateCacheStats]);

  // Memoized function to load calendar data
  const loadCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // Check cache stats first
      const stats = updateCacheStats();

      // Fetch calendar data using the cache system
      const fetchedCalendar = await fetchCalender({
        forceRefresh: !stats.exists || stats.isExpired,
        updateCache: true
      } as FetchOptions) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
        updateCacheStats(); // Update stats after fetch
      } else {
        setCalendarData(null);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  }, [updateCacheStats]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Memoized expiry time calculation
  const expiryInfo = useMemo(() => {
    if (!cacheStats?.exists || cacheStats.expiresIn <= 0) return null;

    const hours = Math.floor(cacheStats.expiresIn / 60);
    const minutes = cacheStats.expiresIn % 60;
    return `${hours} hrs ${minutes} min`;
  }, [cacheStats]);

  // Blur pulse animation for loading state
  const blurPulseStyle = loading ? 'animate-blur-pulse' : '';

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
      {/* Global styles for blurPulse animation */}
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

      <div className="sticky z-50 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-col text-xs sm:text-base">
            <span className="flex items-center gap-1">
              Data outdated? Click to refresh.
              {availableMonths.length > 0 && (
                <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                  {availableMonths.length}/12 months loaded
                </span>
              )}
            </span>
            <span className="text-green-400 font-bold">
              Last fetched:{" "}
              {cacheStats?.exists ? cacheStats.timestamp : "-"}
              {expiryInfo && (
                <span className="ml-1 text-xs">
                  (expires in {expiryInfo})
                </span>
              )}
            </span>
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="bg-green-400 text-black font-extrabold p-1 rounded-md text-xl sm:py-2 sm:px-4 sm:text-base active:scale-95 transition-all duration-300"
          >
            <TbRefresh className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      <Title />
      <div className={`transition-all duration-300 ${blurPulseStyle}`}>
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