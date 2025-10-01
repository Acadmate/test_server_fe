"use client";
import { apiClient } from "@/lib/api";

/**
 * Fetches calendar data with dynamic month caching
 * @param {Object} options - Fetch options
 * @param {boolean} options.forceRefresh - Whether to bypass cache and force a fresh fetch
 * @param {boolean} options.updateCache - Whether to update the cache with new data
 * @param {number} options.cacheExpiry - Cache expiry time in milliseconds (default: 12 hours)
 * @param {boolean} options.lazyLoad - Whether to lazily load data (default: false)
 * @param {number[]} options.specificMonths - Optional array of specific months to fetch (1-12)
 * @returns {Promise<Object>} Calendar data
 */
export async function fetchCalender({
  forceRefresh = false,
  updateCache = true,
  cacheExpiry = 12 * 60 * 60 * 1000,
  lazyLoad = false,
  specificMonths = [] as number[],
} = {}) {
  console.log(
    `fetchCalender: ${
      forceRefresh ? "Forcing refresh" : "Using cache if available"
    }`
  );
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "calendar-cache";
  const CACHE_KEY = "/calendar";
  const CACHE_METADATA_KEY = "calendar-metadata";

  if (lazyLoad && typeof window !== "undefined") {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            const data = await fetchCalendarData();
            resolve(data);
          }
        },
        { threshold: 0.1 }
      );

      const target =
        document.getElementById("calendar-container") || document.body;
      observer.observe(target);
    });
  }

  return fetchCalendarData();

  async function fetchCalendarData() {
    const getCacheMetadata = () => {
      try {
        const metadata = localStorage.getItem(CACHE_METADATA_KEY);
        return metadata ? JSON.parse(metadata) : null;
      } catch (error) {
        console.error("Error reading cache metadata:", error);
        return null;
      }
    };

    const updateCacheMetadata = (data: object) => {
      try {
        const timestamp = Date.now();

        const monthNameToNumber = {
          January: 1,
          February: 2,
          March: 3,
          April: 4,
          May: 5,
          June: 6,
          July: 7,
          August: 8,
          September: 9,
          October: 10,
          November: 11,
          December: 12,
        };

        const availableMonths = Object.keys(data)
          .map(
            (monthName) =>
              monthNameToNumber[monthName as keyof typeof monthNameToNumber]
          )
          .filter((month) => month !== undefined);

        const metadata = {
          timestamp,
          expiresAt: timestamp + cacheExpiry,
          monthCount: Object.keys(data).length || 0,
          availableMonths: availableMonths,
        };

        localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
        console.log("Cache metadata updated:", metadata);
        return metadata;
      } catch (error) {
        console.error("Error updating cache metadata:", error);
      }
    };

    const isCacheExpired = () => {
      const metadata = getCacheMetadata();
      if (!metadata) {
        console.log("No cache metadata found - cache considered expired");
        return true;
      }
      const isExpired = Date.now() > metadata.expiresAt;
      console.log(
        `Cache ${isExpired ? "expired" : "still valid"}. Expires at: ${new Date(
          metadata.expiresAt
        ).toLocaleString()}`
      );
      return isExpired;
    };

    const shouldRefreshForSpecificMonths = () => {
      if (specificMonths.length === 0) return false;

      const metadata = getCacheMetadata();
      if (!metadata || !metadata.availableMonths) return true;

      const missing = !specificMonths.every((month) =>
        metadata.availableMonths.includes(month)
      );

      if (missing) {
        console.log("Some specific months missing from cache");
      }

      return missing;
    };

    // Try to use cache first (unless force refresh is requested)
    if (
      !forceRefresh &&
      "caches" in window &&
      !shouldRefreshForSpecificMonths()
    ) {
      try {
        if (!isCacheExpired()) {
          console.log("Attempting to serve from cache...");
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);

          if (cachedResponse) {
            const data = await cachedResponse.json();
            console.log("Serving calendar from cache:", {
              monthCount: Object.keys(data).length || 0,
            });

            if (updateCache) {
              setTimeout(() => preloadMissingMonths(data), 1000);
            }

            return data;
          } else {
            console.log("No cached response found");
          }
        } else {
          console.log("Calendar cache expired, will fetch fresh data");
        }
      } catch (error) {
        console.error("Error reading calendar from cache:", error);
      }
    } else {
      if (forceRefresh) {
        console.log("Force refresh requested - bypassing cache");
      }
    }

    // Fetch from API
    try {
      console.log("Fetching calendar from API");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (forceRefresh) {
        headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
        headers["Pragma"] = "no-cache";
        console.log("Using no-cache headers for forced refresh");
      } else {
        headers["Cache-Control"] = "max-age=300";
        console.log("Using normal cache headers");
      }

      const response = await apiClient.get(`${api_url}/calendar`, {
        headers,
        withCredentials: true,
      });

      let data = response.data.data;

      if (specificMonths.length > 0 && updateCache && "caches" in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);

          if (cachedResponse) {
            const existingData = await cachedResponse.json();
            data = { ...existingData, ...data };
            console.log("Merged specific months with existing cache");
          }
        } catch (error) {
          console.error("Error merging with existing cache:", error);
        }
      }

      if (updateCache && "caches" in window && data) {
        try {
          console.log("📦 Updating cache with fresh data");
          const cache = await caches.open(CACHE_NAME);
          const responseToCache = new Response(JSON.stringify(data), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": `max-age=${cacheExpiry / 1000}`,
            },
          });
          await cache.put(CACHE_KEY, responseToCache);
          updateCacheMetadata(data);
          console.log("Calendar cache updated successfully");
        } catch (error) {
          console.error("Error updating calendar cache:", error);
        }
      }

      return data;
    } catch (error) {
      console.error("❌ Error fetching calendar from API:", error);

      if ("caches" in window) {
        try {
          console.log("Attempting to serve stale cache as fallback...");
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);

          if (cachedResponse) {
            const data = await cachedResponse.json();
            console.log("Serving stale calendar cache as fallback");
            return data;
          }
        } catch (cacheError) {
          console.error("Error serving stale calendar cache:", cacheError);
        }
      }

      throw error;
    }
  }

  async function preloadMissingMonths(existingData: object) {
    try {
      const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      const monthNameToNumber = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
      };

      const cachedMonths = Object.keys(existingData)
        .map(
          (monthName) =>
            monthNameToNumber[monthName as keyof typeof monthNameToNumber]
        )
        .filter((month) => month !== undefined);

      const missingMonths = allMonths.filter(
        (month) => !cachedMonths.includes(month)
      );

      if (missingMonths.length > 0) {
        console.log(
          `Background preloading ${missingMonths.length} missing months:`,
          missingMonths
        );

        const nextMonthsToLoad = missingMonths.slice(0, 2);

        if (nextMonthsToLoad.length > 0) {
          setTimeout(() => {
            fetchCalender({
              specificMonths: nextMonthsToLoad,
              updateCache: true,
              forceRefresh: false,
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error in preloading missing months:", error);
    }
  }
}

/**
 * @returns {Promise<boolean>}
 */
export async function clearCalendarCache() {
  if ("caches" in window) {
    try {
      await caches.delete("calendar-cache");
      localStorage.removeItem("calendar-metadata");
      console.log("Calendar cache cleared");
      return true;
    } catch (error) {
      console.error("Error clearing calendar cache:", error);
      return false;
    }
  }
  return false;
}

/**
 * @returns {Object}
 */
export function getCalendarCacheStats() {
  const metadata = localStorage.getItem("calendar-metadata");
  if (!metadata) return { exists: false };

  const parsedMetadata = JSON.parse(metadata);
  const now = Date.now();

  return {
    exists: true,
    timestamp: new Date(parsedMetadata.timestamp).toLocaleString(),
    isExpired: now > parsedMetadata.expiresAt,
    expiresIn: Math.max(
      0,
      Math.floor((parsedMetadata.expiresAt - now) / 1000 / 60)
    ),
    monthCount: parsedMetadata.monthCount,
    availableMonths: parsedMetadata.availableMonths || [],
  };
}
