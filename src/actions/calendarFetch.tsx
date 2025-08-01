"use client";
import axios from "axios";

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
  specificMonths = [] as number[]
} = {}) {
  console.log(`fetchCalender: ${forceRefresh ? 'Forcing refresh' : 'Using cache if available'}`);
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const CACHE_NAME = "calendar-cache";
  const CACHE_KEY = "/calendar";
  const CACHE_METADATA_KEY = "calendar-metadata";

  if (lazyLoad && typeof window !== 'undefined') {
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
      
      const target = document.getElementById('calendar-container') || document.body;
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
          "January": 1, "February": 2, "March": 3, "April": 4,
          "May": 5, "June": 6, "July": 7, "August": 8,
          "September": 9, "October": 10, "November": 11, "December": 12
        };
        
        const availableMonths = Object.keys(data)
          .map(monthName => monthNameToNumber[monthName as keyof typeof monthNameToNumber])
          .filter(month => month !== undefined);
        
        const metadata = {
          timestamp,
          expiresAt: timestamp + cacheExpiry,
          monthCount: Object.keys(data).length || 0,
          availableMonths: availableMonths
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

    const shouldRefreshForSpecificMonths = () => {
      if (specificMonths.length === 0) return false;
      
      const metadata = getCacheMetadata();
      if (!metadata || !metadata.availableMonths) return true;
      
      return !specificMonths.every(month => 
        metadata.availableMonths.includes(month)
      );
    };

    if (!forceRefresh && "caches" in window && !shouldRefreshForSpecificMonths()) {
      try {
        if (!isCacheExpired()) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);

          if (cachedResponse) {
            const data = await cachedResponse.json();
            console.log("Serving calendar from cache:", {
              monthCount: Object.keys(data).length || 0
            });
            
            if (updateCache) {
              preloadMissingMonths(data);
            }
            
            return data;
          }
        } else {
          console.log("Calendar cache expired, fetching fresh data");
        }
      } catch (error) {
        console.error("Error reading calendar from cache:", error);
      }
    }

    try {
      console.log("Fetching calendar from API");
      
      const payload = specificMonths.length > 0 
        ? { months: specificMonths } 
        : {};
      
      const response = await axios.get(
        `${api_url}/calendar`,
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Pragma": "no-cache"
          },
          withCredentials: true,
        }
      );

      let data = response.data.data;
      
      if (specificMonths.length > 0 && updateCache && "caches" in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);
          
          if (cachedResponse) {
            const existingData = await cachedResponse.json();
            data = { ...existingData, ...data };
          }
        } catch (error) {
          console.error("Error merging with existing cache:", error);
        }
      }

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
          console.log("Calendar cache updated with fresh data");
        } catch (error) {
          console.error("Error updating calendar cache:", error);
        }
      }

      return data;
    } catch (error) {
      console.error("Error fetching calendar:", error);
      if ("caches" in window) {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(CACHE_KEY);
          
          if (cachedResponse) {
            console.log("API request failed. Serving stale calendar cache as fallback");
            return cachedResponse.json();
          }
        } catch (cacheError) {
          console.error("Error serving stale calendar cache:", cacheError);
        }
      }
      return null;
    }
  }

  async function preloadMissingMonths(existingData: object) {
    try {
      const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      
      const monthNameToNumber = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
      };
      
      const cachedMonths = Object.keys(existingData)
        .map(monthName => monthNameToNumber[monthName as keyof typeof monthNameToNumber])
        .filter(month => month !== undefined);
      
      const missingMonths = allMonths.filter(month => !cachedMonths.includes(month));
      
      if (missingMonths.length > 0) {
        console.log(`Background preloading ${missingMonths.length} missing months:`, missingMonths);
        
        const nextMonthsToLoad = missingMonths.slice(0, 2);
        
        if (nextMonthsToLoad.length > 0) {
          setTimeout(() => {
            fetchCalender({
              specificMonths: nextMonthsToLoad,
              updateCache: true,
              forceRefresh: true
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
 * Clears the calendar cache
 * @returns {Promise<boolean>} Success status
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
 * Gets calendar cache statistics with available months
 * @returns {Object} Cache statistics
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
    expiresIn: Math.max(0, Math.floor((parsedMetadata.expiresAt - now) / 1000 / 60)),
    monthCount: parsedMetadata.monthCount,
    availableMonths: parsedMetadata.availableMonths || []
  };
}