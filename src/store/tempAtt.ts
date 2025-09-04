import { create } from "zustand";

interface AttendanceEntry {
  Slot: string;
  "Hours Absent": string;
  "Course Code": string;
  "Course Title": string;
  "Hours Conducted": string;
  type: string;
  conducted: number;
  Category: string;
  "Attn %": string;
  "Faculty Name": string;
}

interface PredictedAtt {
  setPredictedAtt: (predictedAtt: AttendanceEntry[]) => void;
  predictedAtt: AttendanceEntry[];
}

const usePredictedAtt = create<PredictedAtt>((set) => ({
  setPredictedAtt: (predictedAtt: AttendanceEntry[]) => set({ predictedAtt }),
  predictedAtt: [],
}));

export default usePredictedAtt;
