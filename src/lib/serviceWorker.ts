export function registerServiceWorker() {
  if (process.env.NODE_ENV === "development") {
    console.log("[PWA] Service worker registration skipped in development");
    return;
  }

  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      // First, unregister any existing service workers to ensure clean slate
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          // Only unregister if it's not the current one we're about to register
          if (registration.scope === window.location.origin + "/") {
            registration.unregister();
          }
        });

        // Then register the new one
        navigator.serviceWorker.register("/sw.js").then(
          function (registration) {
            console.log(
              "[PWA] Service Worker registration successful with scope: ",
              registration.scope
            );

            // Handle updates more aggressively
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed") {
                    if (navigator.serviceWorker.controller) {
                      // New update available - force update
                      console.log("[PWA] New version available, updating...");
                      newWorker.postMessage({ type: "SKIP_WAITING" });
                    } else {
                      console.log("[PWA] Content is cached for offline use.");
                    }
                  }
                });
              }
            });

            // Check for updates every 30 seconds (more aggressive)
            setInterval(() => {
              registration.update();
            }, 30000);
          },
          function (err) {
            console.log("[PWA] Service Worker registration failed: ", err);
          }
        );
      });

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[PWA] New service worker activated, reloading...");
        // Clear all caches before reloading
        if ("caches" in window) {
          caches
            .keys()
            .then((cacheNames) => {
              return Promise.all(
                cacheNames.map((cacheName) => {
                  if (
                    cacheName.includes("build-") ||
                    cacheName.includes("static")
                  ) {
                    return caches.delete(cacheName);
                  }
                })
              );
            })
            .then(() => {
              (window as Window).location.reload();
            });
        } else {
          (window as Window).location.reload();
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SW_UPDATE_AVAILABLE") {
          console.log("[PWA] Update available, will reload on next visit");
        }
      });
    });
  }
}

// Function to manually clear all caches (call this if needed)
export function clearAllCaches() {
  if ("caches" in window) {
    return caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log("All caches cleared");
        return true;
      });
  }
  return Promise.resolve(false);
}

declare global {
  interface Window {
    clearCaches?: typeof clearAllCaches;
    listCaches?: () => void;
  }
}

export function addCacheDebugTools() {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    window.clearCaches = clearAllCaches;
    window.listCaches = () => {
      if ("caches" in window) {
        caches.keys().then(console.log);
      }
    };
    console.log(
      "Debug tools available: window.clearCaches(), window.listCaches()"
    );
  }
}
