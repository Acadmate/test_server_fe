// stores/authStore.ts
import { create } from "zustand";
import axios from "axios";
import { getCookie, deleteCookie } from "@/lib/cookies";

const api_url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
  setAuthenticatedUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  error: null,
  isLoading: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null });

    try {
      const token = getCookie("token");

      if (!token) {
        set({
          error: null,
          isCheckingAuth: false,
          isAuthenticated: false,
          user: null,
        });
        return;
      }

      // Set up axios header for the request
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const response = await axios.get(`${api_url}/checkAuth`, {
        withCredentials: true,
      });

      if (response.data.success) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isCheckingAuth: false,
          error: null,
        });
      } else {
        // Invalid token, clear everything
        get().logout();
      }
    } catch (error: unknown) {
      console.log("Auth check failed:", error);
      // Clear auth state on error
      get().logout();
    }
  },

  logout: () => {
    deleteCookie("token");
    delete axios.defaults.headers.common["Authorization"];
    set({
      error: null,
      isCheckingAuth: false,
      isAuthenticated: false,
      user: null,
    });
  },

  setAuthenticatedUser: (user: User) => {
    set({
      user,
      isAuthenticated: true,
      isCheckingAuth: false,
      error: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
