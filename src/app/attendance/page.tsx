"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { fetchAttendance, getAttendanceCacheStats } from "@/actions/attendanceFetch";
import { fetchOrder } from "@/actions/orderFetch";
import { scroller, Element } from "react-scroll";
import { TbRefresh } from "react-icons/tb";
import usePredictedAtt from "@/store/tempAtt";
import useScrollMrks from "@/store/mrksScroll";
import usePredictedButton from "@/store/predictButtonState";
import DashboardMenu from "@/components/shared/dashBoardMenu";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load components that are not immediately needed
const Main = lazy(() => import("@/components/attendance/main"));
const MarkCards = lazy(() => import("@/components/marks/MarkCards"));
const AttMarkSwitch = lazy(() => import("@/components/attendance/AttMarksSwitch"));

const LoadingFallback = () => (
  <div className="w-full flex flex-col items-center justify-center p-2">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-[125px] w-full rounded-xl mt-2" />
    ))}
  </div>
);

type MarksRecord = {
  "Course Code": string;
  "Course Type": string;
  "Test Performance": string;
};

export default function Attendance() {
  const router = useRouter();
  const [dataMarks, setDataMarks] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPredictedAtt, predictedAtt } = usePredictedAtt();
  const { section } = useScrollMrks();
  const { setPredictedButton } = usePredictedButton();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});

  type CacheStats = {
    exists: boolean;
    isExpired: boolean;
    timestamp: string;
    expiresIn: number;
  };

  useEffect(() => {
    const titles = predictedAtt.reduce((acc: Record<string, string>, record) => {
      const code = (record["Course Code"] as string).replace("Regular", "");
      acc[code] = record["Course Title"];
      return acc;
    }, {});
    setCourseTitles(titles);
  }, [predictedAtt]);

  useEffect(() => {
    setPredictedButton(0);
  }, [setPredictedButton]);

  useEffect(() => {
    const isDataLoaded =
      (section === "marks" && dataMarks.length > 0) ||
      (section === "attendance" && predictedAtt.length > 0) ||
      section === "dashboard";

    if (loading || !isDataLoaded) return;

    const sectionId =
      section === "marks" ? "marks-section" : section === "dashboard" ? "dashboard" : "att-section";

    const timer = setTimeout(() => {
      scroller.scrollTo(sectionId, { duration: 500, delay: 0, smooth: "easeInOutQuart" });
    }, 50);
    return () => clearTimeout(timer);
  }, [loading, predictedAtt, dataMarks, section]);

  const updateCacheStats = () => {
    const stats = getAttendanceCacheStats();
    setCacheStats({
      exists: stats.exists,
      timestamp: stats.timestamp || "",
      isExpired: stats.isExpired || false,
      expiresIn: stats.expiresIn || 0,
    });
    return stats;
  };

  // Fetch attendance and order data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Check cache stats first
        const stats = updateCacheStats();

        const attendanceData = await fetchAttendance({
          forceRefresh: !stats.exists || stats.isExpired,
          updateCache: true
        });

        if (attendanceData) {
          setPredictedAtt(attendanceData.attendance || []);
          setDataMarks(attendanceData.marks || []);
          updateCacheStats();
        }

        let orderData
        if (typeof window !== 'undefined') {
          orderData = JSON.parse(localStorage.getItem("order") || "{}");
        }
        const nowUTC = new Date();
        const currentUTCDate = nowUTC.toUTCString().split(" ")[0];

        // Check if order data needs to be refreshed (different day)
        const lastOrderFetch = localStorage.getItem("order-last-fetch");
        const lastFetchDate = lastOrderFetch ? new Date(parseInt(lastOrderFetch)).toUTCString().split(" ")[0] : null;

        if (!orderData || lastFetchDate !== currentUTCDate) {
          const order = await fetchOrder();
          if (order) {
            localStorage.setItem("order", JSON.stringify(order.dayOrder));
            localStorage.setItem("order-last-fetch", Date.now().toString());
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router, setPredictedAtt]);

  const refresh = async () => {
    setLoading(true);
    try {
      // Force a fresh fetch and update the cache
      const attendanceData = await fetchAttendance({
        forceRefresh: true,
        updateCache: true
      });

      if (attendanceData) {
        setPredictedAtt(attendanceData.attendance || []);
        setDataMarks(attendanceData.marks || []);
        updateCacheStats();
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      
    } finally {
      setLoading(false);
    }
  };

  const blurPulseStyle = loading
    ? {
      animation: "blurPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)",
      filter: "blur(0.5px)",
      opacity: 0.8,
      willChange: "filter, opacity",
    }
    : {};

  // Detect slow network connection
  const [isSlowConnection, setIsSlowConnection] = useState(false);
  useEffect(() => {
    type NetworkInformation = {
      effectiveType: string;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    };

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;

    if (connection) {
      const updateConnectionStatus = () => {
        setIsSlowConnection(
          connection.effectiveType === "slow-2g" || connection.effectiveType === "2g"
        );
      };
      updateConnectionStatus();
      connection.addEventListener("change", updateConnectionStatus);
      return () => connection.removeEventListener("change", updateConnectionStatus);
    }
  }, []);

  return (
    <div className="flex flex-col gap-2 w-screen lg:w-[73vw] mx-auto">
      {/* Global styles for blurPulse animation */}
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

      <div className="sticky z-40 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-col text-xs sm:text-base">
            Data outdated? Click to refresh.
            <span className="text-green-400 font-bold">
              Last fetched:{" "}
              {cacheStats?.exists ? cacheStats.timestamp : "-"}
              {cacheStats?.exists && cacheStats.expiresIn > 0 && (
                <span className="ml-1 text-xs">
                  (expires in {cacheStats.expiresIn} min)
                </span>
              )}
            </span>
          </span>
          <button
            onClick={async () => await refresh()}
            disabled={loading}
            className="bg-green-400 text-black font-extrabold p-1 rounded-md text-xl sm:py-2 sm:px-4 sm:text-base active:scale-95 transition-all duration-300"
          >
            <TbRefresh className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isSlowConnection && (
        <div className="bg-yellow-100 text-yellow-800 p-2 text-center text-sm">
          Slow connection detected. Content will load progressively.
        </div>
      )}

      <Element name="dashboard">
        <Suspense>
          <DashboardMenu />
        </Suspense>
      </Element>

      <Element name="att-section" className="transition-all duration-500 ease-in-out" style={blurPulseStyle}>
        <Suspense fallback={<LoadingFallback />}>
          {predictedAtt.length > 0 && <Main data={predictedAtt} />}
        </Suspense>
      </Element>

      <Element name="marks-section">
        <Suspense fallback={<LoadingFallback />}>
          {dataMarks.length > 0 && <MarkCards data={dataMarks} arr={courseTitles} />}
        </Suspense>
      </Element>

      <Suspense>
        <AttMarkSwitch />
      </Suspense>
    </div>
  );
}