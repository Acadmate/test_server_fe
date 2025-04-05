"use client";
import axios from "axios";

/**
 * Fetches timetable data with advanced caching options
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Whether to bypass cache and force a fresh fetch
 * @param {boolean} options.updateCache - Whether to update the cache with new data
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds (default: 6 hours)
 * @returns {Promise<Object>} Timetable data
 */
export async function fetchDetails({ 
  forceRefresh = false, 
  updateCache = true,
  cacheExpiry = 6 * 60 * 60 * 1000 // 6h
} = {}) {
  console.log(`fetchDetails: ${forceRefresh ? 'Forcing refresh' : 'Using cache if available'}`);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "timetable-cache";
  const CACHE_KEY = "/timetable";
  const CACHE_METADATA_KEY = "timetable-metadata";

  // Function to get cache metadata
  const getCacheMetadata = () => {
    try {
      const metadata = localStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error("Error reading cache metadata:", error);
      return null;
    }
  };

  // Function to update cache metadata
  const updateCacheMetadata = (data: string | any[]) => {
    try {
      const timestamp = Date.now();
      const metadata = {
        timestamp,
        expiresAt: timestamp + cacheExpiry,
        dayCount: data?.length || 0
      };
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      return metadata;
    } catch (error) {
      console.error("Error updating cache metadata:", error);
    }
  };

  // Check if cache is expired
  const isCacheExpired = () => {
    const metadata = getCacheMetadata();
    if (!metadata) return true;
    return Date.now() > metadata.expiresAt;
  };

  // Try to get data from cache if not forcing refresh
  if (!forceRefresh && "caches" in window) {
    try {
      // Check if cache is expired via metadata
      if (!isCacheExpired()) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);

        if (cachedResponse) {
          const data = await cachedResponse.json();
          console.log("Serving timetable from cache:", {
            dayCount: data?.length || 0
          });
          return data;
        }
      } else {
        console.log("Timetable cache expired, fetching fresh data");
      }
    } catch (error) {
      console.error("Error reading from timetable cache:", error);
      // Continue to fetch if cache read fails
    }
  }

  // Fetch fresh data from API
  try {
    console.log("Fetching timetable from API");
    const response = await axios.post(
      `${api_url}/timetable`,
      {},
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "Pragma": "no-cache"
        },
        withCredentials: true,
      }
    );

    const data = response.data;

    // Update cache if requested
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
        console.log("Timetable cache updated with fresh data");
      } catch (error) {
        console.error("Error updating timetable cache:", error);
      }
    }

    return data;
  } catch (error) {
    console.error("Error fetching timetable:", error);
    // If API fetch fails, try to serve stale cache as fallback
    if ("caches" in window) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(CACHE_KEY);
        
        if (cachedResponse) {
          console.log("API request failed. Serving stale timetable cache as fallback");
          return cachedResponse.json();
        }
      } catch (cacheError) {
        console.error("Error serving stale timetable cache:", cacheError);
      }
    }
    return null;
  }
}

/**
 * Clears the timetable cache
 * @returns {Promise<boolean>} Success status
 */
export async function clearTimetableCache() {
  if ("caches" in window) {
    try {
      await caches.delete("timetable-cache");
      localStorage.removeItem("timetable-metadata");
      console.log("Timetable cache cleared");
      return true;
    } catch (error) {
      console.error("Error clearing timetable cache:", error);
      return false;
    }
  }
  return false;
}

/**
 * Gets timetable cache statistics
 * @returns {Object} Cache statistics
 */
export function getTimetableCacheStats() {
  const metadata = localStorage.getItem("timetable-metadata");
  if (!metadata) return { exists: false };
  
  const parsedMetadata = JSON.parse(metadata);
  const now = Date.now();
  
  return {
    exists: true,
    timestamp: new Date(parsedMetadata.timestamp).toLocaleString(),
    isExpired: now > parsedMetadata.expiresAt,
    expiresIn: Math.max(0, Math.floor((parsedMetadata.expiresAt - now) / 1000 / 60)),
    dayCount: parsedMetadata.dayCount
  };
}