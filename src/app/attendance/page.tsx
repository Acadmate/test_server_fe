"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAttendance } from "@/actions/attendanceFetch";
import { fetchDetails } from "@/actions/details";
import MarkCards from "@/components/marks/MarkCards";
import Main from "@/components/attendance/main";
import usePredictedAtt from "@/store/tempAtt";
import usetimetable from "@/store/timetable";
import { fetchOrder } from "@/actions/orderFetch";
import useScrollMrks from "@/store/mrksScroll";
import { scroller, Element } from "react-scroll";
import { TbRefresh } from "react-icons/tb";
import { fetchCalender } from "@/actions/calendarFetch";
import AttMarkSwitch from "@/components/attendance/AttMarksSwitch";
import usePredictedButton from "@/store/predictButtonState";
import DashboardMenu from "@/components/shared/dashBoardMenu";
import Loader from "@/components/shared/spinner";

type MarksRecord = {
  "Course Code": string;
  "Course Type": string;
  "Test Performance": string;
};

export default function Attendance() {
  const { setPredictedButton } = usePredictedButton();
  const router = useRouter();
  const [dataMarks, setDataMarks] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { setPredictedAtt, predictedAtt } = usePredictedAtt();
  const { setTimeTable } = usetimetable();
  const { section } = useScrollMrks();

  function getCurrentTimestamp() {
    return new Date().getTime();
  }

  function updateKill(key: string) {
    const kill = JSON.parse(localStorage.getItem("kill") || "{}");
    kill[key] = getCurrentTimestamp();
    localStorage.setItem("kill", JSON.stringify(kill));
  }

  useEffect(() => {
    setPredictedButton(0);
  }, [router]);

  useEffect(() => {
    if (!localStorage.getItem("kill")) {
      localStorage.setItem("kill", JSON.stringify({}));
    }
  }, []);

  useEffect(() => {
    const sectionId =
      section === "marks"
        ? "marks-section"
        : section == "dashboard"
        ? "dashboard"
        : "att-section";
    if (
      (section === "marks" && dataMarks.length > 0) ||
      (section === "attendance" && predictedAtt.length > 0) ||
      section == "dashboard"
    ) {
      scroller.scrollTo(sectionId, {
        duration: 500,
        delay: 0,
        smooth: "easeInOutQuart",
      });
    }
  }, [dataMarks, section]);

  const refresh = async () => {
    setLoading(true);
    try {
      const attendanceData = await fetchAttendance();
      if (attendanceData) {
        localStorage.setItem("att", JSON.stringify(attendanceData));
        setPredictedAtt(attendanceData.attendance || []);
        setDataMarks(attendanceData.marks || []);
        updateKill("att");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(true);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const attData = JSON.parse(localStorage.getItem("att") || "{}");
      const cacheTimeAtt = JSON.parse(localStorage.getItem("kill") || "{}").att;
      const currentTimestamp = getCurrentTimestamp();
      if (
        !attData ||
        Object.keys(attData).length === 0 ||
        !cacheTimeAtt ||
        currentTimestamp - cacheTimeAtt > 2 * 60 * 60 * 1000
      ) {
        const attendanceData = await fetchAttendance();
        if (attendanceData) {
          localStorage.setItem("att", JSON.stringify(attendanceData));
          setPredictedAtt(attendanceData.attendance || []);
          setDataMarks(attendanceData.marks || []);
          updateKill("att");
        }
      } else {
        setPredictedAtt(attData.attendance || []);
        setDataMarks(attData.marks || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      router.replace("/login");
      setError(true);
      localStorage.removeItem("att");
    } finally {
      setLoading(false);
    }
  };

  const calenderData = async () => {
    const calData = JSON.parse(localStorage.getItem("calendar") || "{}");
    const cacheTimeCal = JSON.parse(
      localStorage.getItem("kill") || "{}"
    ).calendar;
    const currentTimestamp = getCurrentTimestamp();
    try {
      if (
        !calData ||
        Object.keys(calData).length === 0 ||
        !cacheTimeCal ||
        currentTimestamp - cacheTimeCal > 23 * 60 * 60 * 1000
      ) {
        const response = await fetchCalender();
        if (response) {
          updateKill("calendar");
          localStorage.setItem("calendar", JSON.stringify(response));
        }
      }
    } catch {
      console.error("Error fetching calendar", error);
      setError(true);
      localStorage.removeItem("calendar");
    }
  };

  const fetchTimetable = async () => {
    const timetable = localStorage.getItem("timetable")
      ? JSON.parse(localStorage.getItem("timetable") || "[]")
      : [];
    const cacheTimeTT = JSON.parse(
      localStorage.getItem("kill") || "{}"
    ).timetable;
    const currentTimestamp = getCurrentTimestamp();

    try {
      if (
        timetable.length == 0 ||
        !Array.isArray(timetable) ||
        !cacheTimeTT ||
        currentTimestamp - cacheTimeTT > 6 * 60 * 60 * 1000 ||
        !timetable
      ) {
        const timetableData = await fetchDetails();
        localStorage.setItem("timetable", JSON.stringify(timetableData));
        setTimeTable(timetableData);
      }
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setError(true);
      localStorage.removeItem("timetable");
    }
  };

  const fetchDo = async () => {
    try {
      const orderData = JSON.parse(localStorage.getItem("order") || "{}");
      const cacheTimeOrder = JSON.parse(
        localStorage.getItem("kill") || "{}"
      ).order;

      const nowUTC = new Date();
      const currentUTCDate = nowUTC.toUTCString().split(" ")[0];

      const lastFetchDate = cacheTimeOrder
        ? new Date(cacheTimeOrder).toUTCString().split(" ")[0]
        : null;

      if (!orderData || lastFetchDate !== currentUTCDate) {
        const order = await fetchOrder();
        if (order) {
          updateKill("order");
          localStorage.setItem("order", JSON.stringify(order.dayOrder));
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError(true);
      localStorage.removeItem("order");
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  useEffect(() => {
    calenderData();
  }, []);

  useEffect(() => {
    fetchTimetable();
  }, []);

  useEffect(() => {
    fetchDo();
  }, []);

  if (loading) {
    return (
      <>
        <Loader />
      </>
    );
  }

  const courseTitles = predictedAtt.reduce(
    (acc: Record<string, string>, record) => {
      acc[(record["Course Code"] as string).replace("Regular", "")] =
        record["Course Title"];
      return acc;
    },
    {}
  );

  return (
    <div className="flex flex-col gap-2 w-screen lg:w-[73vw] mx-auto">
      <AttMarkSwitch />
      <div className="sticky z-40 top-0 left-0 w-full bg-black/70 backdrop-blur-[3px] text-white p-3 shadow-md sm:p-4">
        <div className="flex items-center justify-between">
          <span className="flex flex-col text-xs sm:text-base">
            Data outdated? Click to refresh.
            <span className="text-green-400 font-bold">
              Last fetched:{" "}
              {JSON.parse(localStorage.getItem("kill") || "{}").att
                ? new Date(
                    JSON.parse(localStorage.getItem("kill") || "{}").att
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
      <Element name="dashboard">
        <DashboardMenu />
      </Element>
      <Element name="att-section">
        <Main data={predictedAtt} />
      </Element>
      <Element name="marks-section">
        <MarkCards data={dataMarks} arr={courseTitles} />
      </Element>
    </div>
  );
}
