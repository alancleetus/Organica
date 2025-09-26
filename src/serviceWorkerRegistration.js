// src/serviceWorkerRegistration.js
export function register() {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        // If you deploy under a subpath (e.g. /app/), use "./service-worker.js"
        .register("/service-worker.js")
        .catch((err) => console.error("SW registration failed:", err));
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}
