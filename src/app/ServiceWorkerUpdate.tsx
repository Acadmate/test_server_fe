"use client";
import { useEffect } from "react";

export default function ServiceWorkerUpdate() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered with scope:", registration.scope);

          registration.addEventListener("updatefound", () => {
            console.log("🆕 New service worker found!");

            const newWorker = registration.installing;

            newWorker?.addEventListener("statechange", () => {
              console.log("🔄 New worker state:", newWorker.state);

              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("⚡ New version available");
                if (confirm("New version available. Reload?")) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
