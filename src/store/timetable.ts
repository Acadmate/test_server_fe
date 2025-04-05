import { create } from "zustand";

interface Period {
  period: string;
  timeSlot: string;
}

interface DaySchedule {
  day: string;
  periods: Period[];
}

interface TimeTableData {
  setTimeTable: (timetable: DaySchedule[]) => void;
  timetable: DaySchedule[];
}

const usetimetable = create<TimeTableData>((set) => ({
  setTimeTable: (timetable) => set({ timetable }),
  timetable: [],
}));

/**
 * Represents a course in the timetable
 */
export interface Course {
  CourseCode: string;
  CourseTitle: string;
  FacultyName: string;
  RoomNo: string;
}

/**
 * Represents a single period within a day
 */
export interface PeriodProp {
  period: string;
  timeSlot: string;
  course: Course | null;
}

/**
 * Represents a full day in the timetable
 */
export interface TimetableEntry {
  day: string;
  periods: PeriodProp[];
}

export default usetimetable;
