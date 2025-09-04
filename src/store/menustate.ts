"use client";
import { create } from "zustand";

interface MenuState {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
}

const useMenu = create<MenuState>((set) => ({
  isVisible: false,
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
}));

export default useMenu;
