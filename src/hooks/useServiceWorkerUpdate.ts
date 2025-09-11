"use client";
import { useState, useEffect, useCallback } from "react";
import { getVersionInfo, updateStoredVersion } from "@/utils/versionManager";

interface ServiceWorkerUpdateState {
  isUpdateAvailable: boolean;
  isUpdating: boolean;
  registration: ServiceWorkerRegistration | null;
  isLegacyUser: boolean;
  needsForceUpdate: boolean;
}

export function useServiceWorkerUpdate() {
  const [state, setState] = useState<ServiceWorkerUpdateState>({
    isUpdateAvailable: false,
    isUpdating: false,
    registration: null,
    isLegacyUser: false,
    needsForceUpdate: false,
  });

  const checkForUpdates = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!state.registration) return;

    setState(prev => ({ ...prev, isUpdating: true }));

    try {
      // Send skip waiting message to the waiting service worker
      if (state.registration.waiting) {
        state.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });

      // If no immediate controller change, reload after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to apply update:", error);
      setState(prev => ({ ...prev, isUpdating: false }));
    }
  }, [state.registration]);

  const dismissUpdate = useCallback(() => {
    setState(prev => ({ ...prev, isUpdateAvailable: false }));
  }, []);

  useEffect(() => {
    // Check for legacy users first
    const versionInfo = getVersionInfo();
    const isLegacy = versionInfo.isLegacy;
    const needsForce = versionInfo.needsForceUpdate;

    setState(prev => ({
      ...prev,
      isLegacyUser: isLegacy,
      needsForceUpdate: needsForce,
    }));

    // Update stored version to current
    updateStoredVersion();

    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;

    const handleUpdateFound = () => {
      const newWorker = registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          setState(prev => ({
            ...prev,
            isUpdateAvailable: true,
            registration: registration!,
          }));
        }
      });
    };

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js");
        setState(prev => ({ ...prev, registration }));

        registration.addEventListener("updatefound", handleUpdateFound);

        // Check for updates on page load
        await checkForUpdates();

        // Check for updates every 30 minutes
        const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);

        return () => {
          clearInterval(updateInterval);
          registration?.removeEventListener("updatefound", handleUpdateFound);
        };
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    const cleanup = registerServiceWorker();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [checkForUpdates]);

  return {
    ...state,
    checkForUpdates,
    applyUpdate,
    dismissUpdate,
  };
}
