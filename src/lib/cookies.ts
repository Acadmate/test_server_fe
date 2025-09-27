// Utility functions for managing cookies on the client side

export function setCookie(name: string, value: string, days: number = 7) {
  // Check if we're in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
}

export function getCookie(name: string): string | null {
  // Check if we're in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  } catch (error) {
    console.error("Error accessing cookies:", error);
    return null;
  }
}

export function deleteCookie(name: string) {
  // Check if we're in browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  try {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  } catch (error) {
    console.error("Error deleting cookie:", error);
  }
}
