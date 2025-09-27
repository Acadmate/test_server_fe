export function registerServiceWorker() {
  if (process.env.NODE_ENV === "development") {
    console.log("[PWA] Service worker registration skipped in development");
    return;
  }

  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(
        function (registration) {
          console.log(
            "[PWA] Service Worker registration successful with scope: ",
            registration.scope
          );
        },
        function (err) {
          console.log("[PWA] Service Worker registration failed: ", err);
        }
      );
    });
  }
}
