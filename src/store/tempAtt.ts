import { create } from "zustand";

interface PredictedAtt {
  setPredictedAtt: (predictedAtt: []) => void;
  predictedAtt: [];
}

const usePredictedAtt = create<PredictedAtt>((set) => ({
  setPredictedAtt: (predictedAtt: []) => set({ predictedAtt }),
  predictedAtt: [],
}));

export default usePredictedAtt;
