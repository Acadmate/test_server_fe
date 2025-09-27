import { create } from "zustand";

interface PredictedButton {
  setPredictedButton: (predictedButton: number) => void;
  predictedButton: number;
}

const usePredictedButton = create<PredictedButton>((set) => ({
  setPredictedButton: (predictedButton: number) => set({ predictedButton }),
  predictedButton: 0,
}));

export default usePredictedButton;
