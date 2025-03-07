"use client";
import * as React from "react";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/translucent.css";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { useState } from "react";
import usePredictedAtt from "@/store/tempAtt";
import { fetchAttendance } from "@/actions/attendanceFetch";
import usePredictedButton from "@/store/predictButtonState";
import { IoMdCloseCircle } from "react-icons/io";

interface Period {
  course?: {
    Slot: string;
    CourseCode: string;
  };
}

interface AttendanceEntry {
  Slot: string;
  "Hours Absent": string;
  "Course Code": string;
  "Hours Conducted": string;
  type: string;
  conducted: number;
  Category: string;
  "Attn %": string;
}

interface Day {
  periods: Period[];
}

interface CourseRecord {
  [courseKey: string]: Array<{ [dayOrder: number]: number }>;
}

export default function CalendarPredict() {
  const { setPredictedAtt, predictedAtt } = usePredictedAtt();
  const [lastDate, setLastDate] = useState("");
  const { predictedButton, setPredictedButton } = usePredictedButton();

  const RevMonthMap: { [key: number]: string } = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  const monthMap: { [key: string]: number } = {
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

  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    console.log("Selected Range:", range);
  };

  const reset = () => {
    const att = JSON.parse(localStorage.getItem("att") || "");
    setPredictedAtt(att.attendance);
    setPredictedButton(0);
  };

  function countFrequency(arr: string[]) {
    const frequencyMap: { [key: string]: number } = {};
    for (const num of arr) {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }
    return frequencyMap;
  }

  const ClassesBetweenDates = (range: DateRange | undefined) => {
    const ClassesAttendedTillDayOff: { [key: string]: number } = {};
    const tempCourseRecord: CourseRecord = {};
    const temp: string[] = [];
    const FROM_CURRENT_DAY_TO_OFF_START: string[] = [];

    const caldata = JSON.parse(localStorage.getItem("calendar") || "{}");
    const timetableData = JSON.parse(localStorage.getItem("timetable") || "[]");

    if (!range?.from || !range?.to) return ClassesAttendedTillDayOff;
    const formatDateToString = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

    // const createDateFromString = (dateString: string): Date => {
    //   return new Date(dateString + "T00:00:00.000Z");
    // };

    const startDate = new Date(range.from);
    startDate.setDate(startDate.getDate() + 1);
    const startDateStr = formatDateToString(startDate);
    const endDateStr = formatDateToString(new Date(range.to));

    console.log("Start date:", startDateStr);
    console.log("End date:", endDateStr);

    let currentDateStr = startDateStr;
    const endDateObj = new Date(endDateStr);
    const oneDay = 24 * 60 * 60 * 1000;

    while (
      new Date(currentDateStr) <= new Date(endDateObj.getTime() + oneDay)
    ) {
      const currentDate = new Date(currentDateStr);
      temp.push(currentDate.toISOString());

      // Move to next day
      const nextDate = new Date(currentDate.getTime() + oneDay);
      currentDateStr = formatDateToString(nextDate);
    }

    console.log(
      "All dates in range:",
      temp.map((d) => d.split("T")[0])
    );

    for (const dateStr of temp) {
      const [, month, day] = dateStr.split("T")[0].split("-");
      const monthNumber = parseInt(month, 10);
      const dayNumber = parseInt(day, 10);

      const monthName = RevMonthMap[monthNumber];
      const monthEntries = caldata[monthName] || [];

      const entry = monthEntries.find(
        (e: { Date: string }) => parseInt(e.Date, 10) === dayNumber
      );

      if (entry?.DayOrder && entry.DayOrder !== "-") {
        FROM_CURRENT_DAY_TO_OFF_START.push(entry.DayOrder);
      }
    }

    const AttendedDoFreq = countFrequency(FROM_CURRENT_DAY_TO_OFF_START);
    // console.log("Valid Day Orders:", FROM_CURRENT_DAY_TO_OFF_START);
    console.log("Missed Day order frequency:", AttendedDoFreq);

    timetableData.forEach((day: Day, dayIndex: number) => {
      const dayOrder = dayIndex + 1;

      day.periods.forEach((period: Period) => {
        if (period.course) {
          const isLecture = /^P\d/i.test(period.course.Slot);
          const courseKey = isLecture
            ? `${period.course.CourseCode}-P`
            : period.course.CourseCode;

          if (!tempCourseRecord[courseKey]) {
            tempCourseRecord[courseKey] = Array.from({ length: 5 }, (_, i) => ({
              [i + 1]: 0,
            }));
          }

          const dayEntry = tempCourseRecord[courseKey][dayOrder - 1];
          dayEntry[dayOrder] += 1;
        }
      });
    });

    Object.entries(tempCourseRecord).forEach(([courseCode, dayEntries]) => {
      let total = 0;

      dayEntries.forEach((dayEntry, index) => {
        const dayOrder = (index + 1).toString();
        const count = dayEntry[parseInt(dayOrder, 10)];
        const multiplier = AttendedDoFreq[dayOrder];

        if (typeof multiplier === "number" && count > 0) {
          total += count * multiplier;
        }
      });

      ClassesAttendedTillDayOff[courseCode] = total > 0 ? total : 0;
    });
    return ClassesAttendedTillDayOff;
  };

  const ClassesTillFirstDayOff = (range: DateRange | undefined) => {
    const ClassesAttendedTillDayOff: { [key: string]: number } = {};
    const tempCourseRecord: CourseRecord = {};
    const temp: string[] = [];
    const FROM_CURRENT_DAY_TO_OFF_START: string[] = [];
    const caldata = JSON.parse(localStorage.getItem("calendar") || "{}");
    const timetableData = JSON.parse(localStorage.getItem("timetable") || "[]");
    if (!range?.from) return FROM_CURRENT_DAY_TO_OFF_START;
    const offStart = new Date(range.from);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const normalizeDate = (d: Date) =>
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

    const todayUTC = normalizeDate(tomorrow);
    const current = new Date(todayUTC);

    while (current <= offStart) {
      temp.push(current.toISOString());
      current.setDate(current.getDate() + 1);
    }

    for (const dateStr of temp) {
      const [, month, day] = dateStr.split("T")[0].split("-");
      const monthNumber = parseInt(month, 10);
      const dayNumber = parseInt(day, 10);

      const monthName = RevMonthMap[monthNumber];
      const monthEntries = caldata[monthName] || [];

      const entry = monthEntries.find(
        (e: { Date: string }) => parseInt(e.Date, 10) === dayNumber
      );
      if (entry?.DayOrder != "-") {
        FROM_CURRENT_DAY_TO_OFF_START.push(entry?.DayOrder || null);
      }
    }
    // console.log(FROM_CURRENT_DAY_TO_OFF_START);
    const AttendedDoFreq =
      FROM_CURRENT_DAY_TO_OFF_START.length != 0
        ? countFrequency(FROM_CURRENT_DAY_TO_OFF_START)
        : {};

    // console.log(`Till off day start${AttendedDoFreq}`);

    timetableData.forEach((day: Day, dayIndex: number) => {
      const dayOrder = dayIndex + 1; // Convert to 1-based index

      day.periods.forEach((period: Period) => {
        if (period.course) {
          const isLecture = /^P\d/i.test(period.course.Slot);
          const courseKey = isLecture
            ? `${period.course.CourseCode}-P`
            : period.course.CourseCode;

          if (!tempCourseRecord[courseKey]) {
            tempCourseRecord[courseKey] = Array.from({ length: 5 }, (_, i) => ({
              [i + 1]: 0,
            }));
          }

          const dayEntry = tempCourseRecord[courseKey][dayOrder - 1];
          dayEntry[dayOrder] += 1;
        }
      });
    });
    // console.log(tempCourseRecord);

    Object.entries(tempCourseRecord).forEach(([courseCode, dayEntries]) => {
      let total = 0;

      dayEntries.forEach((dayEntry, index) => {
        const dayOrder = (index + 1).toString();
        const count = dayEntry[parseInt(dayOrder, 10)];
        const multiplier = AttendedDoFreq[dayOrder];

        if (typeof multiplier === "number" && count > 0) {
          total += count * multiplier;
        }
      });

      ClassesAttendedTillDayOff[courseCode] = total > 0 ? total : 0;
    });
    return ClassesAttendedTillDayOff;
  };

  const predict = async (range: DateRange | undefined) => {
    const caldata = JSON.parse(localStorage.getItem("calendar") || "{}");
    const timetableData = JSON.parse(localStorage.getItem("timetable") || "[]");
    const att = JSON.parse(localStorage.getItem("att") || "{}");
    if (Object.keys(caldata).length === 0 && caldata.constructor === Object) {
      setPredictedButton(-1);
      return "Cal data not available";
    }
    if (timetableData.length == 0) {
      setPredictedButton(-1);
      return "timetable data not available";
    }
    if (Object.keys(att).length === 0 && att.constructor === Object) {
      const attData = await fetchAttendance();
      localStorage.setItem("att", attData);
    }
    const attended = ClassesTillFirstDayOff(range);
    const missed = ClassesBetweenDates(range);
    // console.log(attended);
    // console.log(missed);
    const updatedAttendance = JSON.parse(JSON.stringify(att.attendance));

    Object.entries(attended).forEach(([courseCode, value]) => {
      let baseCode: string;
      let category: string;

      if (courseCode.endsWith("-P")) {
        baseCode = courseCode.slice(0, -2);
        category = "Practical";
      } else {
        baseCode = courseCode;
        category = "Theory";
      }

      updatedAttendance.forEach((entry: AttendanceEntry) => {
        if (
          entry["Course Code"].startsWith(baseCode) &&
          entry.Category === category
        ) {
          const currentHours = parseInt(entry["Hours Conducted"]) || 0;
          entry["Hours Conducted"] = (currentHours + value).toString();
        }
      });
    });

    Object.entries(missed).forEach(([courseCode, value]) => {
      let baseCode: string;
      let category: string;

      if (courseCode.endsWith("-P")) {
        baseCode = courseCode.slice(0, -2);
        category = "Practical";
      } else {
        baseCode = courseCode;
        category = "Theory";
      }

      updatedAttendance.forEach((entry: AttendanceEntry) => {
        if (
          entry["Course Code"].startsWith(baseCode) &&
          entry.Category === category
        ) {
          const currentHours = parseInt(entry["Hours Conducted"]) || 0;
          const currentAbsentHours = parseInt(entry["Hours Absent"]) || 0;
          entry["Hours Conducted"] = (currentHours + value).toString();
          entry["Hours Absent"] = (currentAbsentHours + value).toString();
        }
      });
    });

    updatedAttendance.map((item: AttendanceEntry) => {
      item["Attn %"] = (
        ((parseInt(item["Hours Conducted"]) - parseInt(item["Hours Absent"])) /
          parseInt(item["Hours Conducted"])) *
        100
      ).toFixed(2);
    });
    att.attendance = updatedAttendance;
    if (updatedAttendance.length != 0) {
      setPredictedButton(1);
    } else {
      setPredictedButton(0);
      console.log("Attendance Prediction failed");
      return;
    }
    setPredictedAtt(att.attendance);
    console.log(predictedAtt);
  };

  const findLastDate = () => {
    const caldata = JSON.parse(localStorage.getItem("calendar") || "{}");
    const timetableData = JSON.parse(localStorage.getItem("timetable") || "[]");
    if (Object.keys(caldata).length == 0 || timetableData.length == 0) {
      setPredictedButton(-1);
      return "Calendar data or timetable data is not available";
    }
    const d = new Date();
    const currentMonth = d.getMonth() + 1;
    const currentYear = d.getFullYear();
    const month = monthMap[Object.keys(caldata).pop() as keyof typeof monthMap];
    const day = parseInt(
      caldata[Object.keys(caldata).pop() as keyof typeof monthMap].pop()?.Date
    );

    if (currentMonth < month) {
      setLastDate(`${currentYear + 1}-${month}-${day}`);
    }
    setLastDate(`${currentYear}-${month}-${day}`);
  };

  return (
    <div className="flex flex-row items-center gap-4">
      <Tippy
        disabled={predictedButton == -1 || predictedButton == 1 ? true : false}
        interactive={true}
        placement={"bottom"}
        arrow={false}
        zIndex={1}
        theme="translucent"
        trigger="click"
        popperOptions={{
          modifiers: [
            {
              name: "flip",
              enabled: false,
            },
            {
              name: "preventOverflow",
              options: {
                mainAxis: false,
              },
            },
          ],
        }}
        content={
          <div className="flex flex-row w-full items-center justify-center">
            <div className="flex flex-col gap-2">
              <Calendar
                disabled={{
                  before: new Date(),
                  after: new Date(lastDate),
                }}
                mode="range"
                selected={dateRange}
                onSelect={handleSelect}
                className={`rounded-xl border shadow transition bg-white dark:bg-black text-black dark:text-white`}
              />
              <div
                onClick={() =>
                  predict(
                    dateRange
                      ? { from: dateRange.from, to: dateRange.to || undefined }
                      : undefined
                  )
                }
                className="self-end flex flex-row items-center w-fit px-2 py-1 rounded bg-green-200 dark:bg-green-400 text-black"
              >
                Apply
              </div>
            </div>
          </div>
        }
      >
        <div
          onClick={
            predictedButton == 0
              ? () => findLastDate()
              : predictedButton == 1
              ? () => reset()
              : undefined
          }
          className={`${
            predictedButton == -1 ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {predictedButton == 1 ? (
            <div className="flex flex-row text-sm items-center text-black justify-center rounded gap-2 px-1 py-[3px] transition-all duration-100 active:scale-95 font-bold bg-red-400">
              Close
              <span className="text-base">
                <IoMdCloseCircle />
              </span>
            </div>
          ) : (
            <span className="flex flex-row  text-sm items-center justify-center font-bold transition-all duration-100 active:scale-95 bg-green-400 px-1 py-[3px] w-fit h-fit text-black rounded">
              {"Predict"}
            </span>
          )}
        </div>
      </Tippy>

      {/* <div className="text-sm font-medium text-gray-700">
        {dateRange?.from && dateRange.to ? (
          <p>
            <span className="font-bold">
              {new Date(dateRange.from).toISOString().slice(0, 10)} -{" "}
              {new Date(dateRange.to).toISOString().slice(0, 10)}
            </span>
          </p>
        ) : dateRange?.from ? (
          <p>
            Selected Date:{" "}
            <span className="font-bold">
              {new Date(dateRange.from).toISOString().slice(0, 10)}
            </span>
          </p>
        ) : (
          <p>No range selected</p>
        )}
      </div> */}
    </div>
  );
}
