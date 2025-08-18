"use client";
import { apiClient } from "@/lib/api";

type DayOrder = number | "off";
type FallbackResult = DayOrder | null;

const STORAGE_KEYS = {
  order: "order",
  timestamp: "order_timestamp",
} as const;

const MAX_ATTEMPTS = 2;
const API_TIMEOUT_MS = 5000;

const HOLIDAY_TOKENS = ["holiday"];
const HOLIDAY_DAYORDER_TOKENS = ["-"];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeNow(): number {
  return Date.now();
}

function toDateStringUTC(date: Date): string {
  return date.toUTCString().slice(0, 16);
}

function getTodayKey(): string {
  return toDateStringUTC(new Date());
}

function safeParseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function normalizeDayOrder(value: unknown): DayOrder | null {
  if (value === "off") return "off";
  const n = safeParseNumber(value);
  if (n !== null) return n;
  return null;
}

interface CalendarEntry {
  DayOrder?: string;
  Event?: string;
}

function isHolidayFromCalendarEntry(entry: CalendarEntry): boolean {
  const dayOrderToken = String(entry?.DayOrder ?? "").trim();
  const eventLower = String(entry?.Event ?? "").toLowerCase();
  if (HOLIDAY_DAYORDER_TOKENS.includes(dayOrderToken)) return true;
  if (HOLIDAY_TOKENS.some(t => eventLower.includes(t))) return true;
  return false;
}

function getMonthNameUTC(date: Date): string {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return monthNames[date.getUTCMonth()];
}

function getUTCDateOfMonth(date: Date): string {
  return String(date.getUTCDate());
}

function readStoredOrder(): FallbackResult {
  if (!isBrowser()) return null;
  try {
    const orderRaw = window.localStorage.getItem(STORAGE_KEYS.order);
    const tsRaw = window.localStorage.getItem(STORAGE_KEYS.timestamp);
    if (!orderRaw || !tsRaw) return null;

    const storedDateKey = toDateStringUTC(new Date(Number(tsRaw)));
    const todayKey = getTodayKey();
    if (storedDateKey !== todayKey) {
      return null;
    }

    const normalized = normalizeDayOrder(orderRaw);
    return normalized;
  } catch {
    return null;
  }
}

function writeStoredOrder(value: DayOrder): void {
  if (!isBrowser()) return;
  const normalized = normalizeDayOrder(value);
  if (normalized === null) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.order, String(normalized));
    window.localStorage.setItem(STORAGE_KEYS.timestamp, String(safeNow()));
  } catch {
    // Ignore storage errors
  }
}

export function clearDayOrderCache(): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(STORAGE_KEYS.order);
    window.localStorage.removeItem(STORAGE_KEYS.timestamp);
    return true;
  } catch {
    return false;
  }
}

async function fetchDayOrderFromCalendar(): Promise<FallbackResult> {
  if (!isBrowser() || !("caches" in window)) return null;
  try {
    const cache = await caches.open("calendar-cache");
    const cachedResponse = await cache.match("/calendar");
    if (!cachedResponse) return null;

    const data = await cachedResponse.json();
    const now = new Date();
    const monthName = getMonthNameUTC(now);
    const dayStr = getUTCDateOfMonth(now);

    const monthData = data?.[monthName];
    if (!Array.isArray(monthData)) return null;

    const todayEntry = monthData.find((d: CalendarEntry & { Date?: string }) => String(d?.Date) === dayStr);
    if (!todayEntry) return null;

    if (isHolidayFromCalendarEntry(todayEntry)) {
      return "off";
    }
    const normalized = normalizeDayOrder(todayEntry?.DayOrder);
    return normalized;
  } catch {
    return null;
  }
}

// API fetcher with strict validation
async function fetchDayOrderFromAPI(apiBase: string | undefined): Promise<FallbackResult> {
  if (!apiBase) return null;
  try {
    const response = await apiClient.get(`${apiBase}/order`, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      withCredentials: true,
      timeout: API_TIMEOUT_MS,
    });

    const value = response?.data?.dayOrder;
    const normalized = normalizeDayOrder(value);
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Fetches the current day order with robust fallback.
 * Behavior:
 * - Returns number for normal day, "off" for holiday, or null on error.
 * - Never writes undefined/null into localStorage.
 * - Respects same-day cache unless forceRefresh is true.
 */
export async function fetchOrder(options: { forceRefresh?: boolean } = {}): Promise<FallbackResult> {
  const { forceRefresh = false } = options;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (!forceRefresh) {
    const cached = readStoredOrder();
    if (cached !== null) return cached;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const apiOrder = await fetchDayOrderFromAPI(apiBase);
    if (apiOrder !== null) {
      writeStoredOrder(apiOrder);
      return apiOrder;
    }
  }

  const calendarOrder = await fetchDayOrderFromCalendar();
  if (calendarOrder !== null) {
    writeStoredOrder(calendarOrder);
    return calendarOrder;
  }

  const lastResort = readStoredOrder();
  if (lastResort !== null) return lastResort;

  return null;
}
