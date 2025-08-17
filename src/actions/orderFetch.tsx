"use client";
import { apiClient } from "@/lib/api";

/**
 * Fetches the day order from the calendar cache.
 * @returns {Promise<string|number|null>} Day order from calendar, "off" for holiday, or null if not found.
 */
export async function fetchDayOrderFromCalendar(): Promise<string | number | null> {
  console.debug("Starting fetchDayOrderFromCalendar...");
  try {
    const today = new Date();
    const currentDate = today.getDate().toString();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = monthNames[today.getMonth()];

    console.debug("Current date:", currentDate, "Current month:", currentMonth);

    if ("caches" in window) {
      console.debug("Checking calendar cache...");
      const cache = await caches.open("calendar-cache");
      const cachedResponse = await cache.match("/calendar");

      if (cachedResponse) {
        console.debug("Calendar cache found. Parsing data...");
        const calendarData = await cachedResponse.json();
        if (calendarData[currentMonth]) {
          const todayData = calendarData[currentMonth].find(
            (day: { Date: string; }) => day.Date === currentDate
          );

          if (todayData) {
            console.debug("Found today's data in calendar cache:", todayData);

            if (
              todayData.DayOrder === "-" ||
              (todayData.Event && todayData.Event.toLowerCase().includes("holiday"))
            ) {
              console.debug("Today is a holiday according to calendar");
              return "off";
            } else if (todayData.DayOrder) {
              console.debug("Using day order from calendar:", todayData.DayOrder);
              return todayData.DayOrder;
            }
          } else {
            console.debug("Today's data not found in calendar cache.");
          }
        } else {
          console.debug("Current month data not found in calendar cache.");
        }
      } else {
        console.debug("No cached response found for /calendar.");
      }
    } else {
      console.debug("Cache API not available in this environment.");
    }
  } catch (calendarError) {
    console.error("Error checking calendar cache:", calendarError);
  }

  console.debug("Returning null from fetchDayOrderFromCalendar.");
  return null;
}

/**
 * Fetches the current day order with fallback to calendar data for holidays
 * @param {Object} options - Optional configuration
 * @param {boolean} options.forceRefresh - Whether to bypass local storage and force a fresh fetch
 * @returns {Promise<string|number|null>} Day order (number), "0" for holiday, or null on error
 */
export async function fetchOrder({ forceRefresh = false, attempt = 1 } = {}) {
  console.debug("Starting fetchOrder with options:", { forceRefresh, attempt });
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const DAY_ORDER_KEY = "order";
  const DAY_ORDER_TIMESTAMP_KEY = "order_timestamp";
  const MAX_ATTEMPTS = 2;

  const shouldUseStoredOrder = () => {
    console.debug("Checking if stored order should be used...");
    if (forceRefresh) {
      console.debug("Force refresh is enabled. Skipping stored order.");
      return false;
    }

    try {
      const timestamp = localStorage.getItem(DAY_ORDER_TIMESTAMP_KEY);
      if (!timestamp) {
        console.debug("No timestamp found in local storage.");
        return false;
      }
      const storedDate = new Date(parseInt(timestamp, 10)).toDateString();
      const currentDate = new Date().toDateString();

      console.debug("Stored date:", storedDate, "Current date:", currentDate);
      return storedDate === currentDate;
    } catch (error) {
      console.error("Error checking day order timestamp:", error);
      return false;
    }
  };

  if (shouldUseStoredOrder()) {
    const storedOrder = localStorage.getItem(DAY_ORDER_KEY);
    if (storedOrder !== null) {
      console.debug("Using stored day order:", storedOrder);
      return storedOrder;
    } else {
      console.debug("Stored day order is null.");
    }
  }

  try {
    console.debug("Fetching day order from API...");
    const response = await apiClient.get(
      `${api_url}/order`,
      { 
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        withCredentials: true,
        timeout: 5000,
      }
    );

    console.log(response)

    const dayOrder = response.data?.dayOrder;
    console.debug("API response dayOrder:", dayOrder);

    if (typeof dayOrder === "undefined" || dayOrder === null) {
      console.debug("Day order is undefined or null.");
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`Retrying fetchOrder (attempt ${attempt + 1})...`);
        const calendarOrder = await fetchDayOrderFromCalendar();
        if (calendarOrder !== null) {
          console.debug("Using calendar order as fallback:", calendarOrder);
          localStorage.setItem(DAY_ORDER_KEY, calendarOrder.toString());
          localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());
          return calendarOrder;
        } else {
          return fetchOrder({ forceRefresh, attempt: attempt + 1 });
        }
      } else {
        console.warn("Max attempts reached with undefined day order.");
        return null;
      }
    }

    console.debug("Storing valid day order in local storage:", dayOrder);
    localStorage.setItem(DAY_ORDER_KEY, dayOrder.toString());
    localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());

    return dayOrder;
  } catch (error) {
    console.error("Error fetching day order:", error);

    console.debug("Attempting to fetch day order from calendar cache...");
    const calendarOrder = await fetchDayOrderFromCalendar();
    if (calendarOrder !== null) {
      console.debug("Using calendar order as fallback:", calendarOrder);
      localStorage.setItem(DAY_ORDER_KEY, calendarOrder.toString());
      localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());
      return calendarOrder;
    }

    const lastResortOrder = localStorage.getItem(DAY_ORDER_KEY);
    if (lastResortOrder !== null) {
      console.debug("Using previously stored day order as fallback:", lastResortOrder);
      return lastResortOrder;
    }

    console.debug("Returning null from fetchOrder.");
    return null;
  }
}

/**
 * Clears the day order from local storage
 * @returns {boolean} Success status
 */
export function clearDayOrderCache() {
  console.debug("Clearing day order cache...");
  try {
    localStorage.removeItem("order");
    localStorage.removeItem("order_timestamp");
    console.debug("Day order cache cleared successfully.");
    return true;
  } catch (error) {
    console.error("Error clearing day order cache:", error);
    return false;
  }
}