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
import { fetchCalender } from "@/actions/calendarFetch";
import { fetchTimetable } from "@/actions/timetableFetch";
import { AttendanceEntry } from "@/types";

interface Period {
  course?: {
    Slot: string;
    CourseCode: string;
  };
}

interface Day {
  periods: Period[];
}

interface CourseRecord {
  [courseKey: string]: Array<{ [dayOrder: number]: number }>;
}

export default function CalendarPredict() {
  const [lastDate, setLastDate] = useState("");
  const { predictedButton, setPredictedButton } = usePredictedButton();
  const { setPredictedAtt } = usePredictedAtt();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const reset = async () => {
    setIsProcessing(true);
    try {
      const att = await fetchAttendance();
      if (att && att.attendance) {
        setPredictedAtt(att.attendance);
        setPredictedButton(0);
      }
    } catch (error) {
      console.error("Error resetting attendance data:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  function countFrequency(arr: string[]) {
    const frequencyMap: { [key: string]: number } = {};
    for (const num of arr) {
      if (num !== null) {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      }
    }
    return frequencyMap;
  }

  const ClassesBetweenDates = async (range: DateRange | undefined) => {
    const ClassesAttendedTillDayOff: { [key: string]: number } = {};
    const tempCourseRecord: CourseRecord = {};
    const temp: string[] = [];
    const FROM_CURRENT_DAY_TO_OFF_START: string[] = [];

    const caldata = await fetchCalender();
    const timetableData = await fetchTimetable();

    if (!range?.from || !range?.to) return ClassesAttendedTillDayOff;
    const formatDateToString = (date: Date): string => {
      return date.toISOString().split("T")[0];
    };

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

  const ClassesTillFirstDayOff = async (range: DateRange | undefined) => {
    const ClassesAttendedTillDayOff: { [key: string]: number } = {};
    const tempCourseRecord: CourseRecord = {};
    const temp: string[] = [];
    const FROM_CURRENT_DAY_TO_OFF_START: string[] = [];
    const caldata = await fetchCalender();
    const timetableData = await fetchTimetable();
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
      if (entry?.DayOrder && entry?.DayOrder !== "-") {
        FROM_CURRENT_DAY_TO_OFF_START.push(entry.DayOrder);
      }
    }

    const AttendedDoFreq =
      FROM_CURRENT_DAY_TO_OFF_START.length !== 0
        ? countFrequency(FROM_CURRENT_DAY_TO_OFF_START)
        : {};

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

  const predict = async (range: DateRange | undefined) => {
    if (!range?.from) {
      alert("Please select a date range first");
      return;
    }
    
    setIsProcessing(true);
    try {
      const caldata = await fetchCalender();
      const timetableData = await fetchTimetable();
      const att = await fetchAttendance();
      
      if (!att || !att.attendance || att.attendance.length === 0) {
        console.error("No attendance data available");
        setPredictedButton(-1);
        return;
      }

      if (Object.keys(caldata).length === 0) {
        console.error("Calendar data not available");
        setPredictedButton(-1);
        return "Calendar data not available";
      }
      
      if (!timetableData || timetableData.length === 0) {
        console.error("Timetable data not available");
        setPredictedButton(-1);
        return "Timetable data not available";
      }

      const attendedClasses = await ClassesTillFirstDayOff(range);
      const missedClasses = await ClassesBetweenDates(range);
      
      console.log("Attended classes:", attendedClasses);
      console.log("Missed classes:", missedClasses);

      // Create a deep copy to ensure we're not mutating original data
      const updatedAttendance = JSON.parse(JSON.stringify(att.attendance));

      // Process attended classes (classes that will be attended)
      Object.entries(attendedClasses).forEach(([courseCode, value]) => {
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

      // Process missed classes (absent during the selected period)
      Object.entries(missedClasses).forEach(([courseCode, value]) => {
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

      // Fix: properly calculate attendance percentages
      updatedAttendance.forEach((item: AttendanceEntry) => {
        const conducted = parseInt(item["Hours Conducted"]) || 0;
        const absent = parseInt(item["Hours Absent"]) || 0;
        
        // Avoid division by zero
        if (conducted > 0) {
          const attended = conducted - absent;
          const percentage = (attended / conducted) * 100;
          item["Attn %"] = percentage.toFixed(2);
        } else {
          item["Attn %"] = "0.00";
        }
      });

      // Update the state with the new attendance data
      console.log("Setting updated attendance:", updatedAttendance);
      setPredictedAtt(updatedAttendance);
      setPredictedButton(1);
      
    } catch (error) {
      console.error("Error predicting attendance:", error);
      setPredictedButton(-1);
    } finally {
      setIsProcessing(false);
    }
  };

  const findLastDate = async () => {
    setIsProcessing(true);
    try {
      const caldata = await fetchCalender();
      const timetableData = await fetchTimetable();
      console.log(caldata, timetableData)
      if (Object.keys(caldata).length === 0 || !timetableData || timetableData.length === 0) {
        setPredictedButton(-1);
        setIsProcessing(false);
        return "Calendar data or timetable data is not available";
      }
      
      const d = new Date();
      const currentMonth = d.getMonth() + 1;
      const currentYear = d.getFullYear();
      const lastMonthKey = Object.keys(caldata).pop();
      if (!lastMonthKey) {
        setPredictedButton(-1);
        setIsProcessing(false);
        return "No calendar months available";
      }
      
      const month = monthMap[lastMonthKey as keyof typeof monthMap];
      const lastMonthEntries = caldata[lastMonthKey];
      
      if (!lastMonthEntries || lastMonthEntries.length === 0) {
        setPredictedButton(-1);
        setIsProcessing(false);
        return "No entries in last calendar month";
      }
      
      const day = parseInt(lastMonthEntries[lastMonthEntries.length - 1]?.Date);
      
      // Calculate year based on month comparison
      const year = currentMonth < month ? currentYear - 1 : currentYear;
      const lastDateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      setLastDate(lastDateStr);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error finding last date:", error);
      setPredictedButton(-1);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-row items-center gap-4 relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
          <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      )}
      
      <Tippy
        disabled={predictedButton === -1 || predictedButton === 1 }
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
                  after: lastDate ? new Date(lastDate) : undefined,
                }}
                mode="range"
                selected={dateRange}
                onSelect={handleSelect}
                className={`rounded-xl border shadow transition bg-white dark:bg-black text-black dark:text-white`}
              />
              <div
                onClick={() => {
                  if (dateRange?.from) {
                    predict(dateRange);
                  } else {
                    alert("Please select a date range");
                  }
                }}
                className="self-end flex flex-row items-center w-fit px-2 py-1 rounded bg-green-200 dark:bg-green-400 text-black cursor-pointer hover:bg-green-300 transition-colors"
              >
                Apply
              </div>
            </div>
          </div>
        }
      >
        <div
          onClick={
            predictedButton === 0
              ? () => findLastDate()
              : predictedButton === 1
              ? () => reset()
              : undefined
          }
          className={`${
            predictedButton === -1 || isProcessing ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          }`}
        >
          {predictedButton === 1 ? (
            <div className="flex flex-row text-sm items-center text-black justify-center rounded gap-2 px-1 py-[3px] transition-all duration-100 active:scale-95 font-bold bg-red-400">
              Close
              <span className="text-base">
                <IoMdCloseCircle />
              </span>
            </div>
          ) : (
            <span className="flex flex-row text-sm items-center justify-center font-bold transition-all duration-100 active:scale-95 bg-green-400 px-1 py-[3px] w-fit h-fit text-black rounded">
              {"Predict"}
            </span>
          )}
        </div>
      </Tippy>
    </div>
  );
}