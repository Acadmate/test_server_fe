"use client";
import Margin from "@/components/attendance/margin";
import dynamic from "next/dynamic";
import Title from "../shared/title";
import { FaExclamationCircle } from "react-icons/fa";
import usePredictedButton from "@/store/predictButtonState";

const Alert = dynamic(() => import("@/components/shared/alert"), {
  ssr: false,
});

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

type MainProps = {
  data: AttendanceRecord[];
};

export default function Main({ data }: MainProps) {
  const { predictedButton } = usePredictedButton();
  return (
    <div className="z-30 mx-auto h-fit w-screen lg:w-[73vw] rounded-b p-1">
      <Title />
      {data && data.length > 0 ? (
        <div className="flex flex-col gap-2 border border-gray-300 dark:border-gray-700 rounded-2xl">
          {data.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col rounded-2xl ${
                index % 2 == 0 ? "dark:bg-[#171B26]" : "dark:bg-black"
              } items-center px-3 py-2 gap-2`}
            >
              <div className="flex flex-col md:flex-row w-full">
                <div className="flex flex-col gap-2 lg:gap-4 w-full">
                  <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center justify-items gap-2">
                      <div
                        className={`py-1 px-2 rounded-full text-[10px] text-xs w-fit h-fit font-extrabold ${
                          item.Category.toLowerCase() == "theory"
                            ? "bg-orange-300 text-black dark:bg-black dark:text-orange-400"
                            : "bg-green-300 text-black dark:bg-black dark:text-green-400"
                        }`}
                      >
                        {item.Category.charAt(0)}
                      </div>
                      <div
                        className={`py-1 px-2 rounded text-xs w-fit h-fit font-extrabold ${
                          item.Category.toLowerCase() == "theory"
                            ? "bg-orange-300 text-black dark:bg-black dark:text-orange-400"
                            : "bg-green-300 text-black dark:bg-black dark:text-green-400"
                        }`}
                      >
                        {item["Course Code"].replace("Regular", "")}
                      </div>
                    </div>

                    <span className="flex sm:hidden">
                      <Margin
                        hoursConducted={parseInt(item["Hours Conducted"])}
                        hoursAbsent={parseInt(item["Hours Absent"])}
                        attendance={parseInt(item["Attn %"])}
                      />
                    </span>
                  </div>
                  <p className="text-md lg:text-xl font-semibold">
                    {item["Course Title"]}
                  </p>
                </div>

                <div className="flex flex-row w-full justify-end">
                  <div className="flex flex-row w-full md:w-[456px] justify-between items-center">
                    <div className="flex flex-row">
                      <div className="flex flex-row justify-center items-center px-2 h-fit bg-gray-200 text-black dark:bg-white rounded-l-2xl text-base md:text-md font-bold w-fit gap-[5px]">
                        <span className="rounded-[100px] bg-black text-black text-white text-xs px-[5px]">
                          T
                        </span>
                        {item["Hours Conducted"]}
                      </div>
                      <div className="flex flex-row font-bold bg-red-200 dark:bg-[#3C1E1B] text-[#F54B2A] px-2 text-base md:text-md items-center justify-center w-fit h-fit gap-[5px]">
                        <span className="text-red-500 rounded-[100px] bg-black text-xs px-[5px]">
                          A
                        </span>
                        {item["Hours Absent"]}
                      </div>
                      <div className="flex flex-row justify-center items-center px-2 h-fit bg-green-200 dark:bg-[#1B3C1E] text-base md:text-md rounded-r-2xl text-green-500 dark:text-[#49DE80] font-bold w-fit gap-[5px]">
                        <span className="text-green-500 rounded-[100px] bg-black text-xs px-[5px]">
                          P
                        </span>
                        {parseInt(item["Hours Conducted"]) -
                          parseInt(item["Hours Absent"])}
                      </div>
                    </div>
                    <div className="hidden sm:flex">
                      <Margin
                        hoursConducted={parseInt(item["Hours Conducted"])}
                        hoursAbsent={parseInt(item["Hours Absent"])}
                        attendance={parseInt(item["Attn %"])}
                      />
                    </div>
                    {parseInt(item["Attn %"]) <= 75 ? (
                      <div className="w-[60px] h-[60px]">
                        <Alert />
                      </div>
                    ) : (
                      <div className="w-[60px] h-[60px]"></div>
                    )}
                    <p
                      className={`text-[26px] md:text-3xl font-extrabold text-nowrap ${
                        parseInt(item["Attn %"]) >= 90
                          ? "text-green-400"
                          : parseInt(item["Attn %"]) >= 75
                          ? "text-orange-300"
                          : "text-red-400"
                      }`}
                    >
                      {item["Attn %"]} %
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`flex-row gap-[3px] w-full text-xs text-black-500 dark:text-yellow-500 ${
                  predictedButton == 1 ? "flex items-center" : "hidden"
                }`}
              >
                <span>
                  <FaExclamationCircle />
                </span>
                <span>Attendance prediction is on</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center h-[20vh] border rounded-[20px] mx-5">
          <p className="text-lg font-bold">No attendance data available.</p>
        </div>
      )}
    </div>
  );
}
