import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CalendarMonthState {
  month: number;
  setMonth: (value: number) => void;
}

const useMonth = create<CalendarMonthState>()(
  persist(
    (set) => ({
      month: new Date().getMonth() + 1,
      setMonth: (value) => set({ month: value }),
    }),
    { name: "calendar-month" }
  )
);

export default useMonth;
