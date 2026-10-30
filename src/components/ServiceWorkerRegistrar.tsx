"use client";

/**
 * Registers the AdaptiveMinds service worker after the page loads.
 * Only runs in production or when NEXT_PUBLIC_SW_ENABLED=true.
 *
 * Safety: registration is silently skipped if the browser does not
 * support service workers or if the env flag is not set.
 */

import { useEffect } from "react";

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) return;

    // Respect explicit opt-in in development; always register in production
    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NEXT_PUBLIC_SW_ENABLED !== "true"
    ) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        // Check for updates on every page load
        reg.update().catch(() => {});
      })
      .catch(() => {
        // Registration failure is non-fatal — app works fully online
      });
  }, []);

  return null;
}
