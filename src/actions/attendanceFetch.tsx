"use client";
import { apiClient } from "@/lib/api";
import { fetchOrder } from "./orderFetch";
import { fetchTimetable } from "./timetableFetch";
import { fetchCalender } from "./calendarFetch";

/**
 * Fetches attendance data with advanced caching options
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Whether to bypass cache and force a fresh fetch
 * @param {boolean} options.updateCache - Whether to update the cache with new data
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds (default: 2 hours)
 * @returns {Promise<Object>} Attendance data
 */
export async function fetchAttendance({
  forceRefresh = false,
  updateCache = true,
  cacheExpiry = 4 * 60 * 60 * 1000 // 4h
} = {}) {
  console.log(`fetchAttendance: ${forceRefresh ? 'Forcing refresh' : 'Using cache if available'}`);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "attendance-cache";
  const CACHE_KEY = "/attendance";
  const CACHE_METADATA_KEY = "attendance-metadata";

  const getCacheMetadata = () => {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error("Error reading cache metadata:", error);
      return null;
    }
  };

  const updateCacheMetadata = (data: { attendance: string | unknown[]; marks: string | unknown[]; }) => {
    try {
      const timestamp = Date.now();
      const metadata = {
        timestamp,
        expiresAt: timestamp + cacheExpiry,
        recordCount: data.attendance?.length || 0,
        marksCount: data.marks?.length || 0
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      return metadata;
    } catch (error) {
      console.error("Error updating cache metadata:", error);
    }
  };

  const isCacheExpired = () => {
    const metadata = getCacheMetadata();
    if (!metadata) return true;
    return Date.now() > metadata.expiresAt;
  };

  if (!forceRefresh && "caches" in window) {
    try {
      if (!isCacheExpired()) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          const data = await cachedResponse.json();
          console.log("Serving from cache:", {
            recordCount: data.attendance?.length || 0,
            marksCount: data.marks?.length || 0
          });
          return data;
        }
      } else {
        console.log("Cache expired, fetching fresh data");
      }
    } catch (error) {
      console.error("Error reading from cache:", error);

    }
  }

  try {
    console.log("Fetching from API");
    const response = await apiClient.get(
      `${api_url}/attendance`,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache",
        },
        withCredentials: true,
      }
    );

    const data = response.data.data;
    console.log(data)

    if (updateCache && "caches" in window && data) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const responseToCache = new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': `max-age=${cacheExpiry / 1000}`
          }
        });
        await cache.put(CACHE_KEY, responseToCache);
        updateCacheMetadata(data);
        console.log("Cache updated with fresh data");
      } catch (error) {
        console.error("Error updating cache:", error);
      }
    }

    setTimeout(async () => {
      await fetchTimetable()
      await fetchCalender()
      await fetchOrder()
    }, 0);

    return data;
  } catch (error) {
    console.error("Error fetching attendance:", error);
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          console.log("API request failed. Serving stale cache as fallback");
          cachedResponse.json();
        }
      } catch (cacheError) {
        console.error("Error serving stale cache:", cacheError);
      }
    }
    return null;
  }
}

/**
 * Clears the attendance cache
 * @returns {Promise<boolean>} Success status
 */
export async function clearAttendanceCache() {
  if ("caches" in window) {
    try {
      await caches.delete("attendance-cache");
      localStorage.removeItem("attendance-metadata");
      console.log("Attendance cache cleared");
      return true;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return false;
    }
  }
  return false;
}

/**
 * Gets cache statistics
 * @returns {Object} Cache statistics
 */
export function getAttendanceCacheStats() {
  const metadata = localStorage.getItem("attendance-metadata");
  if (!metadata) return { exists: false };

  const parsedMetadata = JSON.parse(metadata);
  const now = Date.now();

  return {
    exists: true,
    timestamp: new Date(parsedMetadata.timestamp).toLocaleString(),
    isExpired: now > parsedMetadata.expiresAt,
    expiresIn: Math.max(0, Math.floor((parsedMetadata.expiresAt - now) / 1000 / 60)), // minutes
    recordCount: parsedMetadata.recordCount,
    marksCount: parsedMetadata.marksCount
  };
}