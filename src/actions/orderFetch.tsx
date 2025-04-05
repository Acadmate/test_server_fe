"use client";
import axios from "axios";

/**
 * Fetches the day order from the calendar cache.
 * @returns {Promise<string|number|null>} Day order from calendar, "off" for holiday, or null if not found.
 */
export async function fetchDayOrderFromCalendar(): Promise<string | number | null> {
  try {
    const today = new Date();
    const currentDate = today.getDate().toString();
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonth = monthNames[today.getMonth()];

    if ("caches" in window) {
      const cache = await caches.open("calendar-cache");
      const cachedResponse = await cache.match("/calendar");

      if (cachedResponse) {
        const calendarData = await cachedResponse.json();
        if (calendarData[currentMonth]) {
          const todayData = calendarData[currentMonth].find(
            (day: { Date: string; }) => day.Date === currentDate
          );

          if (todayData) {
            console.log("Found today in calendar cache:", todayData);

            if (
              todayData.DayOrder === "-" ||
              (todayData.Event && todayData.Event.toLowerCase().includes("holiday"))
            ) {
              console.log("Today is a holiday according to calendar");
              return "off";
            } else if (todayData.DayOrder) {
              console.log("Using day order from calendar:", todayData.DayOrder);
              return todayData.DayOrder;
            }
          }
        }
      }
    }
  } catch (calendarError) {
    console.error("Error checking calendar cache:", calendarError);
  }

  return null;
}

/**
 * Fetches the current day order with fallback to calendar data for holidays
 * @param {Object} options - Optional configuration
 * @param {boolean} options.forceRefresh - Whether to bypass local storage and force a fresh fetch
 * @returns {Promise<string|number|null>} Day order (number), "0" for holiday, or null on error
 */
export async function fetchOrder({ forceRefresh = false, attempt = 1 } = {}) {
  const api_url = process.env.NEXT_PUBLIC_API_URL;
  const DAY_ORDER_KEY = "order";
  const DAY_ORDER_TIMESTAMP_KEY = "order_timestamp";
  const MAX_ATTEMPTS = 2;

  const shouldUseStoredOrder = () => {
    if (forceRefresh) return false;

    try {
      const timestamp = localStorage.getItem(DAY_ORDER_TIMESTAMP_KEY);
      if (!timestamp) return false;
      const storedDate = new Date(parseInt(timestamp, 10)).toDateString();
      const currentDate = new Date().toDateString();

      return storedDate === currentDate;
    } catch (error) {
      console.error("Error checking day order timestamp:", error);
      return false;
    }
  };

  if (shouldUseStoredOrder()) {
    const storedOrder = localStorage.getItem(DAY_ORDER_KEY);
    if (storedOrder !== null) {
      console.log("Using stored day order:", storedOrder);
      return storedOrder;
    }
  }

  try {
    console.log("Fetching day order from API");
    const response = await axios.post(
      `${api_url}/order`,
      {},
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
        withCredentials: true,
        timeout: 5000,
      }
    );

    const dayOrder = response.data;

    if (typeof dayOrder === "undefined" || dayOrder === null) {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`Day order is undefined. Retrying fetchOrder (attempt ${attempt + 1})...`);
        const calendarOrder = await fetchDayOrderFromCalendar();
        if (calendarOrder !== null) {
          localStorage.setItem(DAY_ORDER_KEY, calendarOrder.toString());
          localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());
          return calendarOrder;
        } else {
          return fetchOrder({ forceRefresh, attempt: attempt + 1 });
        }
      } else {
        console.warn("Max attempts reached with undefined day order");
        return null;
      }
    }

    // Only store valid values
    localStorage.setItem(DAY_ORDER_KEY, dayOrder.toString());
    localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());

    return dayOrder;
  } catch (error) {
    console.error("Error fetching day order:", error);

    // Attempt to get day order from calendar cache
    const calendarOrder = await fetchDayOrderFromCalendar();
    if (calendarOrder !== null) {
      localStorage.setItem(DAY_ORDER_KEY, calendarOrder.toString());
      localStorage.setItem(DAY_ORDER_TIMESTAMP_KEY, Date.now().toString());
      return calendarOrder;
    }

    const lastResortOrder = localStorage.getItem(DAY_ORDER_KEY);
    if (lastResortOrder !== null) {
      console.log("Using previously stored day order as fallback:", lastResortOrder);
      return lastResortOrder;
    }

    return null;
  }
}

/**
 * Clears the day order from local storage
 * @returns {boolean} Success status
 */
export function clearDayOrderCache() {
  try {
    localStorage.removeItem("order");
    localStorage.removeItem("order_timestamp");
    console.log("Day order cache cleared");
    return true;
  } catch (error) {
    console.error("Error clearing day order cache:", error);
    return false;
  }
}