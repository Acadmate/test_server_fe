"use client";
import MainCal from "@/components/calendar/main";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCalender } from "@/actions/calendarFetch";
import Title from "@/components/shared/title";
import { TbRefresh } from "react-icons/tb";
import Loader from "@/components/shared/spinner";
import MonthNavigate from "@/components/calendar/month_navigate";

export default function Calender() {
  const router = useRouter();
  const [calendarData, setCalendar] = useState(null);
  const getCurrentTimestamp = () => new Date().getTime();
  const [loading, setLoading] = useState(true);

  const updateCacheTimestamp = (key: string) => {
    const cache = JSON.parse(localStorage.getItem("kill") || "{}");
    cache[key] = getCurrentTimestamp();
    localStorage.setItem("kill", JSON.stringify(cache));
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const fetchedCalendar = await fetchCalender();
      localStorage.setItem("calendar", JSON.stringify(fetchedCalendar));
      updateCacheTimestamp("calendar");
      setCalendar(fetchedCalendar);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
    setLoading(false);
  };

  const calenderData = async () => {
    const cachedCalendar = localStorage.getItem("calendar");
    const cacheTime = JSON.parse(localStorage.getItem("kill") || "{}").calendar;
    const currentTimestamp = getCurrentTimestamp();
    const cacheExpired =
      !cacheTime || currentTimestamp - cacheTime > 12 * 60 * 60 * 1000;

    if (!cachedCalendar || cacheExpired) {
      setLoading(true);
      try {
        const fetchedCalendar = await fetchCalender();
        localStorage.setItem("calendar", JSON.stringify(fetchedCalendar));
        updateCacheTimestamp("calendar");
        setCalendar(fetchedCalendar);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
        setCalendar(null);
      }
      setLoading(false);
    } else {
      setCalendar(JSON.parse(cachedCalendar));
      setLoading(false);
    }
  };

  useEffect(() => {
    calenderData();
  }, [router]);

  if (loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  if (!calendarData) {
    return (
      <div className="text-center text-lg mt-16">
        <p>Failed to load calendar data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-fit mx-auto">
      <MonthNavigate />
      <div className="sticky z-50 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-col text-xs sm:text-base">
            Data outdated? Click to refresh.
            <span className="text-green-400 font-bold">
              Last fetched:{" "}
              {JSON.parse(localStorage.getItem("kill") || "{}").calendar
                ? new Date(
                    JSON.parse(localStorage.getItem("kill") || "{}").calendar
                  ).toLocaleString()
                : "-"}
            </span>
          </span>
          <button
            onClick={refresh}
            className="bg-green-400 text-black font-extrabold p-1 rounded-md text-xl sm:py-2 sm:px-4 sm:text-base active:scale-95 transition-all duration-300"
          >
            <TbRefresh />
          </button>
        </div>
      </div>
      <Title />
      <MainCal data={calendarData} />
    </div>
  );
}
