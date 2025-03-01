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

export default usetimetable;
