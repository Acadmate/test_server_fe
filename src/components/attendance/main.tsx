"use client";
import { memo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Margin from "@/components/attendance/margin";
// import dynamic from "next/dynamic";
import Title from "../shared/title";
import { FaExclamationCircle } from "react-icons/fa";
import usePredictedButton from "@/store/predictButtonState";
import { useInView } from "react-intersection-observer";
import "react-circular-progressbar/dist/styles.css";
import { CirculurProgress } from "./circulurProgress";
// const Alert = dynamic(() => import("@/components/shared/alert"), {
//   ssr: false,
//   loading: () => <div className="w-[60px] h-[60px]"></div>,
// });

import { AttendanceRecord } from "@/types";

type MainProps = {
  data: AttendanceRecord[];
};

const AttendanceItem = memo(
  ({
    item,
    index,
    showPredicted,
  }: {
    item: AttendanceRecord;
    index: number;
    showPredicted: boolean;
  }) => {
    const { ref, inView } = useInView({
      triggerOnce: true,
      rootMargin: "200px",
    });

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      if (inView && !isLoaded) {
        setIsLoaded(true);
      }
    }, [inView, isLoaded]);

    const facultyName = item["Faculty Name"];
    const hoursConducted = parseInt(item["Hours Conducted"]);
    const hoursAbsent = parseInt(item["Hours Absent"]);
    const attendance = parseFloat(item["Attn %"]);
    const present = hoursConducted - hoursAbsent;
    const isTheory = item.Category.toLowerCase() === "theory";
    const courseCode = item["Course Code"].replace("Regular", "");
    // const isLowAttendance = attendance <= 75;
    const room = item["Room No"];

    if (!isLoaded) {
      return (
        <div
          ref={ref}
          className={`flex flex-col rounded-2xl ${index % 2 === 0
            ? "bg-gray-100 dark:bg-[#171B26]"
            : "bg-white dark:bg-black"
            } items-center px-3 py-2 gap-2 h-24`}
        />
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: index * 0.05,
          ease: [0.21, 1.11, 0.81, 0.99],
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        whileTap={{ scale: 0.98 }}
        className={`flex flex-col rounded-2xl dark:bg-[#171B26] bg-gray-100 items-center p-4 gap-2 shadow-lg dark:shadow-none border border-gray-200 dark:border-transparent cursor-pointer`}
      >
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col justify-between">
              <motion.div
                className="flex flex-row items-center justify-items gap-4 w-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
              >
                <motion.div
                  className={`rounded-full text-[13px] w-fit h-fit font-extrabold ${isTheory
                    ? "text-black dark:text-orange-300"
                    : "text-[#10b981] dark:text-[#6cf1cd]"
                    }`}
                  transition={{ duration: 0.2 }}
                >
                  {item.Category.toUpperCase() == "THEORY" ? "THEORY" : "LAB"}
                </motion.div>
                <motion.div
                  className={`rounded text-[13px] w-fit h-fit font-extrabold ${isTheory
                    ? "text-black dark:text-orange-300"
                    : "text-[#10b981] dark:text-[#6cf1cd]"
                    }`}
                  transition={{ duration: 0.2 }}
                >
                  {courseCode}
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
              >
                <p className="text-xl font-semibold block text-gray-800 dark:text-white">
                  {item["Course Title"]}
                </p>
              </motion.div>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 + 0.4, duration: 0.5 }}
            >
              <Margin
                hoursConducted={hoursConducted}
                hoursAbsent={hoursAbsent}
                attendance={attendance}
              />
            </motion.span>
          </div>

          <motion.div
            className="flex flex-col w-full justify-end bg-gray-100 dark:bg-[#44464a] p-2 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 + 0.5, duration: 0.5 }}
          >
            <div className="relative flex flex-row w-full justify-between items-start">
              <div className="flex flex-col w-full justify-between items-start">
              <motion.div
                  className="flex flex-row gap-4"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.6, duration: 0.5 }}
                >
                  <motion.div
                    className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit"
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-[10px] font-bold">Total</span>
                    <span className="text-[15px] font-semibold">
                      {hoursConducted}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit"
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-[10px] font-bold">Absent</span>
                    <span className="text-[15px] font-semibold">
                      {hoursAbsent}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit"
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-[10px] font-bold">Present</span>
                    <span className="text-[15px] font-semibold">{present}</span>
                  </motion.div>
              </motion.div>
              <motion.div
                className="flex flex-col text-sm gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.7, duration: 0.5 }}
              >
                <p className="text-gray-800 dark:text-white">
                  <span className="text-xs text-gray-500 dark:text-[#b4b4b4]">
                    Venue
                  </span>
                  <br />
                  <span className="flex flex-row w-fit">{room}</span>
                </p>
                <p className="text-gray-800 dark:text-white">
                  <span className="text-xs text-gray-500 dark:text-[#b4b4b4]">
                    Faculty
                  </span>
                  <br />
                  <span className="text-sm">{facultyName}</span>
                </p>
              </motion.div>
              </div>
              <motion.div
                className=""
                style={{ width: 80, height: 80 }}
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.05 + 0.8,
                  duration: 0.8,
                  ease: "backOut",
                }}
              >
                <CirculurProgress value={attendance} size={80} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {showPredicted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-row gap-[3px] w-full text-xs text-amber-600 dark:text-yellow-500 items-center"
            >
              <motion.span
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <FaExclamationCircle />
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Attendance prediction is on
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }
);

AttendanceItem.displayName = "AttendanceItem";

function Main({ data }: MainProps) {
  const { predictedButton } = usePredictedButton();

  const hasData = data && data.length > 0;

  return (
    <motion.div
      className="z-30 mx-auto h-fit w-screen lg:w-[73vw] rounded-b p-1 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Title />
      {hasData ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {data.map((item, index) => (
            <AttendanceItem
              key={`${item["Course Code"]}-${index}`}
              item={item}
              index={index}
              showPredicted={predictedButton === 1}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          className="flex flex-row items-center justify-center h-[20vh] border border-gray-200 dark:border-gray-700 rounded-[20px] mx-5 bg-white dark:bg-transparent"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            No attendance data available.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default memo(Main);
