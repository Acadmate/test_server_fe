// Version management for PWA updates
// This helps identify legacy users and force them to update

export const APP_VERSION = "2.0.0"; // Current app version
export const MIN_REQUIRED_VERSION = "2.0.0"; // Minimum version required

export interface VersionInfo {
  current: string;
  required: string;
  isLegacy: boolean;
  needsForceUpdate: boolean;
}

export function getVersionInfo(): VersionInfo {
  if (typeof window === 'undefined') {
    return {
      current: APP_VERSION,
      required: MIN_REQUIRED_VERSION,
      isLegacy: false,
      needsForceUpdate: false
    };
  }

  // Get stored version from localStorage
  const storedVersion = localStorage.getItem('acadmate-version') || '1.0.0';
  
  // Check if this is a legacy version
  const isLegacy = compareVersions(storedVersion, MIN_REQUIRED_VERSION) < 0;
  
  // Legacy users need force update if they don't have the new update mechanism
  const needsForceUpdate = isLegacy || !hasUpdateMechanism();

  return {
    current: storedVersion,
    required: MIN_REQUIRED_VERSION,
    isLegacy,
    needsForceUpdate
  };
}

export function updateStoredVersion(version: string = APP_VERSION): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('acadmate-version', version);
  }
}

export function hasUpdateMechanism(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if the new update mechanism exists
  return !!(
    window.navigator?.serviceWorker &&
    typeof window.navigator.serviceWorker.register === 'function'
  );
}

export function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
}

export function isLegacyUser(): boolean {
  const versionInfo = getVersionInfo();
  return versionInfo.isLegacy;
}

export function needsForceUpdate(): boolean {
  const versionInfo = getVersionInfo();
  return versionInfo.needsForceUpdate;
}

// Force clear all caches for legacy users
export async function forceClearCaches(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }

    // Clear service worker
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
    }

    // Clear localStorage items related to caching
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('cache') || 
        key.includes('sw') || 
        key.includes('pwa') ||
        key.includes('acadmate-version')
      )) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log('🧹 Cleared all caches for legacy user');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}
