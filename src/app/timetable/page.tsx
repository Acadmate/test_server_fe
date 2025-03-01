"use client";
import Timetable from "@/components/timetable/main";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { fetchDetails } from "@/actions/details";
import usetimetable from "@/store/details";
import { TbRefresh } from "react-icons/tb";
import { fetchOrder } from "@/actions/orderFetch";
import { fetchAttendance } from "@/actions/attendanceFetch";

const Loader = dynamic(() => import("@/components/shared/spinner"), {
  ssr: false,
});

export default function TimetablePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setTimeTable } = usetimetable();
  const getCurrentTimestamp = () => new Date().getTime();

  const updateCacheTimestamp = (key: string) => {
    const cache = JSON.parse(localStorage.getItem("kill") || "{}");
    cache[key] = getCurrentTimestamp();
    localStorage.setItem("kill", JSON.stringify(cache));
  };

  const redirectToLogin = () => {
    localStorage.clear();
    router.replace("/login");
  };

  const refreshTimetable = async () => {
    setLoading(true);
    try {
      const timetableData = await fetchDetails();
      if (timetableData) {
        localStorage.setItem("timetable", JSON.stringify(timetableData));
        setTimeTable(timetableData);
        updateCacheTimestamp("timetable");
      } else {
        throw new Error("Failed to fetch timetable");
      }
    } catch (error) {
      console.error("Error refreshing timetable:", error);
      setError(true);
      localStorage.removeItem("timetable");
    } finally {
      setLoading(false);
    }
  };

  const initializeData = async () => {
    const cachedTimetable = localStorage.getItem("timetable");
    const cacheTime = JSON.parse(
      localStorage.getItem("kill") || "{}"
    ).timetable;
    const currentTimestamp = getCurrentTimestamp();
    const cacheExpired =
      !cacheTime || currentTimestamp - cacheTime > 6 * 60 * 60 * 1000;
    if (!cachedTimetable || cacheExpired) {
      await refreshTimetable();
    } else {
      setTimeTable(JSON.parse(cachedTimetable));
    }
  };

  const fetchAttendanceData = async (): Promise<void> => {
    try {
      setLoading(false);
      const cacheTime = JSON.parse(localStorage.getItem("kill") || "{}").att;
      const cacheExpired =
        !cacheTime || getCurrentTimestamp() - cacheTime > 2 * 60 * 60 * 1000;

      if (cacheExpired || !localStorage.getItem("att")) {
        const attendanceData = await fetchAttendance();
        if (attendanceData) {
          localStorage.setItem("att", attendanceData);
          updateCacheTimestamp("att");
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      const cacheTime = JSON.parse(localStorage.getItem("kill") || "{}").order;
      const lastFetchDate = cacheTime
        ? new Date(cacheTime).toUTCString().split(" ")[0]
        : null;
      const todayDate = new Date().toUTCString().split(" ")[0];

      if (!lastFetchDate || lastFetchDate !== todayDate) {
        const orderData = await fetchOrder();
        if (orderData) {
          localStorage.setItem("order", orderData);
          updateCacheTimestamp("order");
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(true);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("stats")) {
      redirectToLogin();
    } else {
      initializeData();
    }
  }, [router]);

  useEffect(() => {
    fetchAttendanceData();
    fetchOrderData();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-16 flex flex-col items-center justify-center w-[200px] h-[200px]">
        <Loader />
      </div>
    );
  }

  if (error || !localStorage.getItem("timetable")) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p className="text-xl font-bold">No timetable data available.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center mx-auto h-fit w-screen lg:w-[73vw]">
      <div className="z-49 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-col text-xs sm:text-base">
            Data outdated? Click to refresh.
            <span className="text-green-400 font-bold">
              Last fetched:{" "}
              {JSON.parse(localStorage.getItem("kill") || "{}").timetable
                ? new Date(
                    JSON.parse(localStorage.getItem("kill") || "{}").timetable
                  ).toLocaleString()
                : "-"}
            </span>
          </span>
          <button
            onClick={refreshTimetable}
            className="bg-green-400 text-black font-extrabold p-1 rounded-md text-xl sm:py-2 sm:px-4 sm:text-base active:scale-95 transition-all duration-300"
          >
            <TbRefresh />
          </button>
        </div>
      </div>
      <Timetable />
    </div>
  );
}
