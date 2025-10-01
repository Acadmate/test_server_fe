import { create } from "zustand";

interface TimeTableData {
  setTimeTable: (timetable: object) => void;
  timetable: object;
}

const usetimetable = create<TimeTableData>((set) => ({
  setTimeTable: (timetable) => set({ timetable }),
  timetable: {},
}));

export default usetimetable;
