/**
 * Utility functions for calculating and displaying last fetched time
 */

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
    // Silently fail if localStorage is not available
  }
}

export function getLastFetchedHours(key: string): string {
  const timestamp = getLastFetchedTime(key);
  
  if (!timestamp) {
    return "Never fetched";
  }
  
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours === 0) {
    return diffMinutes <= 1 ? "Just now" : `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}

export function formatLastFetchedText(key: string): string {
  const hours = getLastFetchedHours(key);
  return `Last fetched: ${hours}`;
}
