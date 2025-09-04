"use client";
import { create } from "zustand";

interface useScrollMrksprops {
  section: string;
  setSection: (section: string) => void;
}

const useScrollMrks = create<useScrollMrksprops>((set) => ({
  setSection: (section) => set({ section }),
  section: "attendance",
}));

export default useScrollMrks;
