"use client";
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Margin from "@/components/attendance/margin";
import Title from "../shared/title";
import { FaExclamationCircle } from "react-icons/fa";
import usePredictedButton from "@/store/predictButtonState";
import "react-circular-progressbar/dist/styles.css";
import { CirculurProgress } from "./circulurProgress";

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
    const facultyName = item["Faculty Name"];
    const hoursConducted = parseInt(item["Hours Conducted"]);
    const hoursAbsent = parseInt(item["Hours Absent"]);
    const attendance = parseFloat(item["Attn %"]);
    const present = hoursConducted - hoursAbsent;
    const isTheory = item.Category.toLowerCase() === "theory";
    const courseCode = item["Course Code"].replace("Regular", "");
    const room = item["Room No"];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          // ✅ Changed: Increased duration for a smoother entrance
          duration: 0.4,
          // ✅ Changed: Increased delay for a more noticeable stagger effect
          delay: index * 0.05,
          ease: "easeOut",
        }}
        className={`flex flex-col rounded-2xl dark:bg-[#171B26] bg-gray-100 items-center p-4 gap-2 shadow-lg dark:shadow-none border border-gray-200 dark:border-transparent cursor-pointer`}
      >
        {/* ... rest of your JSX for the card ... */}
        <div className="flex flex-col w-full gap-4">
          <div className="flex flex-row justify-between w-full">
            <div className="flex flex-col justify-between">
              <div className="flex flex-row items-center justify-items gap-4 w-full">
                <div
                  className={`rounded-full text-[13px] w-fit h-fit font-extrabold ${
                    isTheory
                      ? "text-black dark:text-orange-300"
                      : "text-[#10b981] dark:text-[#6cf1cd]"
                  }`}
                >
                  {item.Category.toUpperCase() == "THEORY" ? "THEORY" : "LAB"}
                </div>
                <div
                  className={`rounded text-[13px] w-fit h-fit font-extrabold ${
                    isTheory
                      ? "text-black dark:text-orange-300"
                      : "text-[#10b981] dark:text-[#6cf1cd]"
                  }`}
                >
                  {courseCode}
                </div>
              </div>
              <div>
                <p className="text-xl font-semibold block text-gray-800 dark:text-white">
                  {item["Course Title"]}
                </p>
              </div>
            </div>
            <Margin
              hoursConducted={hoursConducted}
              hoursAbsent={hoursAbsent}
              attendance={attendance}
            />
          </div>

          <div className="flex flex-col w-full justify-end bg-gray-100 dark:bg-[#44464a] p-2 rounded-xl">
            <div className="relative flex flex-row w-full justify-between items-start">
              <div className="flex flex-col w-full justify-between items-start">
                <div className="flex flex-row gap-4">
                  <div className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit">
                    <span className="text-[10px] font-bold">Total</span>
                    <span className="text-[15px] font-semibold">
                      {hoursConducted}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit">
                    <span className="text-[10px] font-bold">Absent</span>
                    <span className="text-[15px] font-semibold">
                      {hoursAbsent}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center items-center h-fit text-gray-800 dark:text-white w-fit">
                    <span className="text-[10px] font-bold">Present</span>
                    <span className="text-[15px] font-semibold">{present}</span>
                  </div>
                </div>
                <div className="flex flex-col text-sm gap-1">
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
                </div>
              </div>
              <div className="" style={{ width: 80, height: 80 }}>
                <CirculurProgress value={attendance} size={80} />
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {showPredicted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              // ✅ Changed: Slightly longer duration for a smoother reveal
              transition={{ duration: 0.3 }}
              className="flex flex-row gap-[3px] w-full text-xs text-amber-600 dark:text-yellow-500 items-center"
            >
              <FaExclamationCircle />
              <span>Attendance prediction is on</span>
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
      // ✅ Changed: A slightly softer fade-in for the whole container
      transition={{ duration: 0.3 }}
    >
      <Title />
      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 rounded-2xl">
          {data.map((item, index) => (
            <AttendanceItem
              key={`${item["Course Code"]}-${index}`}
              item={item}
              index={index}
              showPredicted={predictedButton === 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center h-[20vh] border border-gray-200 dark:border-gray-700 rounded-[20px] mx-5 bg-white dark:bg-transparent">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            No attendance data available.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default memo(Main);
