"use client";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { fetchCalender } from "@/actions/calendarFetch";
import Title from "@/components/shared/title";
import RefreshHeader from "@/components/shared/RefreshHeader";
import PageSkeleton from "@/components/shared/skeleton/PageSkeleton";
import {
  formatLastFetchedText,
  setLastFetchedTime,
} from "@/lib/lastFetchedUtils";
import { useAuthStore } from "@/store/authStore";
import { AuthLoadingScreen } from "@/components/shared/LoadingComponents";

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
  const router = useRouter();
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  // Data states
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  // Refresh function - forces fresh data
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;

    console.log("Manual refresh triggered - forcing fresh data");
    setLoading(true);
    setHasError(false);

    try {
      const fetchedCalendar = (await fetchCalender({
        forceRefresh: true, // Only force refresh on manual refresh
        updateCache: true,
      } as FetchOptions)) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
        setHasError(false);
        setLastFetchedTime("calendar");
      } else {
        setHasError(true);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setHasError(true);
      if (error instanceof Error && error.message.includes("401")) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  // Initial load function - uses cache when possible
  const loadCalendarData = useCallback(async () => {
    if (!isAuthenticated) return;

    console.log("Loading calendar data - checking cache first");
    setLoading(true);
    setHasError(false);

    try {
      const fetchedCalendar = (await fetchCalender({
        forceRefresh: false, // ✅ Use cache if available
        updateCache: true,
      } as FetchOptions)) as CalendarData | null;

      if (fetchedCalendar) {
        setCalendarData(fetchedCalendar);
        setHasError(false);
        setLastFetchedTime("calendar");
        console.log("Calendar data loaded successfully");
      } else {
        console.log("No calendar data returned");
        setHasError(true);
      }
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setHasError(true);
      if (error instanceof Error && error.message.includes("401")) {
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isCheckingAuth, router]);

  useEffect(() => {
    if (isCheckingAuth || !isAuthenticated) return;
    loadCalendarData();
  }, [loadCalendarData, isAuthenticated, isCheckingAuth]);

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return <AuthLoadingScreen />;
  }

  // Show redirecting screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">
            Access denied. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  // Show skeleton while loading (first time or refreshing)
  if (loading) {
    return (
      <div className="flex flex-col gap-2 w-fit mx-auto">
        <div className="h-16" />
        <div className="w-[95vw] lg:w-[72vw] mx-auto h-16" />
        <div className="h-12" />
        <PageSkeleton type="calendar" />
      </div>
    );
  }

  // Show error state only if there's an actual error AND loading is complete
  if (hasError || !calendarData) {
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

  // Show main content when everything is loaded successfully
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
        additionalInfo={formatLastFetchedText("calendar")}
        zIndex={30}
      />
      <Title />
      <div
        className={`transition-all duration-300 ${
          loading ? "animate-blur-pulse" : ""
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
