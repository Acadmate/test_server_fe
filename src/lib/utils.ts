import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Cache utilities
export const getCurrentTimestamp = () => new Date().getTime();

export const updateCacheTimestamp = (key: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`${key}-timestamp`, getCurrentTimestamp().toString());
  }
};

// Network utilities
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

function getNetworkInformation(): NetworkInformation | undefined {
  if (typeof window !== "undefined" && "connection" in navigator) {
    return navigator.connection as NetworkInformation;
  }
  return undefined;
}

export const detectSlowConnection = (): boolean => {
  const connection = getNetworkInformation();
  return !!(
    connection &&
    connection.effectiveType &&
    (connection.effectiveType === "slow-2g" ||
      connection.effectiveType === "2g")
  );
};

export const addConnectionChangeListener = (
  callback: () => void
): (() => void) => {
  const connection = getNetworkInformation();
  if (connection) {
    connection.addEventListener("change", callback);
    return () => connection.removeEventListener("change", callback);
  }
  return () => {};
};

// PDF utilities
export const captureElementAsPDF = async (element: HTMLElement) => {
  if (!element) return;

  try {
    // Dynamically import libraries
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");

    // Store original display style
    const originalDisplay = element.style.display;
    element.style.display = "flex"; // Ensure it's not hidden

    // Detect current theme
    const isDarkMode = document.documentElement.classList.contains("dark");

    // Apply theme to ensure correct colors are captured
    if (isDarkMode) {
      element.classList.add("dark");
    } else {
      element.classList.remove("dark");
    }

    // Capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Increase resolution
      useCORS: true,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    });

    // Restore original display
    element.style.display = originalDisplay;

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/png");

    // Match the width of the timetable in the PDF
    const imgWidth = canvas.width / 3;
    const imgHeight = canvas.height / 3;

    // Create a PDF with the same width as the captured table
    const pdf = new jsPDF({
      orientation: imgWidth > imgHeight ? "l" : "p",
      unit: "px",
      format: [imgWidth, imgHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("TimeTable.pdf");
  } catch (error) {
    console.error("Error capturing element as PDF:", error);
  }
};

export const downloadWithOptimizedLayout = (
  captureFunction: () => Promise<void>
) => {
  // Store original width
  const originalWidth = document.body.style.width;

  // Force desktop width
  document.body.style.width = "1200px";

  // Capture and download
  captureFunction().finally(() => {
    // Restore original width
    document.body.style.width = originalWidth;
  });
};

// Last fetched utilities
export function getLastFetchedTime(key: string): number | null {
  if (typeof window === "undefined") return null;

  try {
    const timestamp = localStorage.getItem(`${key}-last-fetch`);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch {
    return null;
  }
}

export function setLastFetchedTime(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(`${key}-last-fetch`, Date.now().toString());
  } catch {
    // Handle localStorage errors silently
  }
}

export function getLastFetchedHours(key: string): string {
  const timestamp = getLastFetchedTime(key);
  if (!timestamp) return "Never";

  const now = Date.now();
  const diffMs = now - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}m ago`;
  } else {
    return "Just now";
  }
}

export function formatLastFetchedText(key: string): string {
  const hours = getLastFetchedHours(key);
  return `Last updated: ${hours}`;
}

// Cookie utilities
export function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
