"use client";
import { clearAuthToken } from "@/lib/auth-utils";
import { apiClient } from "@/lib/api";

/**
 * Signs out the user and clears all application cache data
 * @returns {Promise<boolean|Object>} Success status or response data
 */
export async function signout() {
  const api_url = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Clear cache data first
    await clearAllCacheData();

    // Attempt server-side logout
    const response = await apiClient.post(
      `${api_url}/signout`,
      {},
      {
        withCredentials: true,
        timeout: 5000, // 5 second timeout
        headers: {
          "Cache-Control": "no-cache, no-store",
        },
      }
    );

    // Clear auth data after successful signout
    clearAuthToken();
    console.log("Sign out successful");

    return { success: true, ...response.data };
  } catch (error) {
    console.error("Error during sign out:", error);

    try {
      // Clear local data even if server logout failed
      await clearAllCacheData();
      clearAuthToken();

      console.log("Local logout completed despite server error");
      return {
        success: true,
        localOnly: true,
        message: "Logged out locally. Server logout may have failed.",
      };
    } catch (cacheError) {
      console.error("Error clearing cache during failed signout:", cacheError);
      // Still clear auth token as last resort
      clearAuthToken();
      return {
        success: true,
        localOnly: true,
        message: "Basic logout completed with errors.",
      };
    }
  }
}

/**
 * Clears all application cache and local storage data
 * @returns {Promise<void>}
 */
async function clearAllCacheData() {
  // Clear all localStorage except auth data (which will be cleared by clearAuthData)
  localStorage.removeItem("kill");

  if ("caches" in window) {
    try {
      const cacheNames = [
        "calendar-cache",
        "timetable-cache",
        "attendance-cache",
      ];

      await Promise.all(
        cacheNames.map((cacheName) =>
          caches
            .delete(cacheName)
            .catch((err) => console.warn(`Failed to delete ${cacheName}:`, err))
        )
      );

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.includes("-cache"))
          .map((key) => caches.delete(key))
      );

      console.log("All cache data cleared");
    } catch (error) {
      console.error("Error clearing cache storage:", error);
      throw error;
    }
  }
}

/**
 * Checks if user is currently signed in based on client-side data
 * @returns {boolean} Whether user appears to be signed in
 */
export function isUserSignedIn() {
  const hasAuthData = Boolean(localStorage.getItem("kill"));
  return hasAuthData;
}
