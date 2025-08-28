"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { fetchAttendance } from "@/actions/attendanceFetch";
import { fetchOrder } from "@/actions/orderFetch";
import { Element } from "react-scroll";
import RefreshHeader from "@/components/shared/RefreshHeader";
import usePredictedAtt from "@/store/tempAtt";
import usePredictedButton from "@/store/predictButtonState";
import DashboardMenu from "@/components/shared/dashBoardMenu";
import { Skeleton } from "@/components/ui/skeleton";

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

type AttendanceRecord = {
  "Course Code": string;
  "Course Title": string;
  Category: string;
  "Faculty Name": string;
  Slot: string;
  "Hours Conducted": string;
  "Hours Absent": string;
  "Attn %": string;
};

export default function Attendance() {
  const router = useRouter();
  const [dataMarks, setDataMarks] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { setPredictedAtt, predictedAtt } = usePredictedAtt();
  const { setPredictedButton, predictedButton } = usePredictedButton();
  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});

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
    const fetchData = async () => {
      setLoading(true);
      try {

        const attendanceData = await fetchAttendance({
          forceRefresh: true,
          updateCache: true
        });

        if (attendanceData) {
          setOriginalAttendance(attendanceData.attendance || []);
          setPredictedAtt(attendanceData.attendance || []);
          setDataMarks(attendanceData.marks || []);
        }

        let orderData
        if (typeof window !== 'undefined') {
          orderData = JSON.parse(localStorage.getItem("order") || "{}");
        }
        const nowUTC = new Date();
        const currentUTCDate = nowUTC.toUTCString().split(" ")[0];

        const lastOrderFetch = localStorage.getItem("order-last-fetch");
        const lastFetchDate = lastOrderFetch ? new Date(parseInt(lastOrderFetch)).toUTCString().split(" ")[0] : null;

        if (!orderData || lastFetchDate !== currentUTCDate) {
          const order = await fetchOrder();
          if (order) {
            localStorage.setItem("order", JSON.stringify(order));
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
      const attendanceData = await fetchAttendance({
        forceRefresh: true,
        updateCache: true
      });

      if (attendanceData) {
        setPredictedAtt(attendanceData.attendance || []);
        setOriginalAttendance(attendanceData.attendance || []); // ✅ Fix: Update original data too
        setDataMarks(attendanceData.marks || []);
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

  const [originalAttendance, setOriginalAttendance] = useState<AttendanceRecord[]>([]);

  const displayData = predictedButton === 1 ? predictedAtt : originalAttendance;

  return (
    <div className="flex flex-col gap-2 w-screen lg:w-[73vw] mx-auto">  
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

      <RefreshHeader
        onRefresh={refresh}
        loading={loading}
        zIndex={30}
        className="w-[95vw] lg:w-[72vw] mx-auto"
      />

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
          {displayData.length > 0 && <Main data={displayData} />}
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