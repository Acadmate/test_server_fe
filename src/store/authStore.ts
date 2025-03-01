import { create } from "zustand";
import axios from "axios";

const api_url = process.env.NEXT_PUBLIC_API_URL;

interface AuthState {
  isAuthenticated: boolean;
  error: null | string;
  isLoading: boolean;
  isCheckingAuth: boolean;
  signin: (email: string, password: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  timetable: () => Promise<void>;
}

export const UseAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  signin: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    const payload = {
      username: email,
      password: password,
    };
    try {
      const response = await axios.post(`${api_url}/login`, payload, {
        withCredentials: true,
      });
      console.log(response.data[1]);

      // Set authenticated state AFTER successful response
      set({
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      localStorage.setItem("stats", "true");
      localStorage.setItem("kill", JSON.stringify({}));
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  timetable: async () => {
    set({ isLoading: true, error: null });
    try {
      await axios.post(`${api_url}/timetable`, {
        withCredentials: true,
      });

      set({
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });

      localStorage.setItem("stats", "true");
      localStorage.setItem("kill", JSON.stringify({}));
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });
    try {
      const response = await axios.get(`${api_url}/checkAuth`, {
        withCredentials: true,
      });

      set({
        isAuthenticated: response.data.authenticated,
        isCheckingAuth: false,
      });

      if (!response.data.authenticated) {
        localStorage.removeItem("stats");
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        isCheckingAuth: false,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || "Authentication check failed"
          : "Authentication check failed",
      });
      localStorage.removeItem("stats");
    }
  },
}));
