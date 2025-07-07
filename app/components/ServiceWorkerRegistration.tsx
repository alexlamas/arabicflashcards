"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [swState, setSwState] = useState<"idle" | "installing" | "active" | "error">("idle");

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      console.warn("[ServiceWorker] Not supported in this browser");
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        setSwState("installing");
        
        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated") {
              setSwState("active");
              console.log("[ServiceWorker] New version activated");
              
              // Optionally reload for major updates
              if (registration.waiting) {
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
            }
          });
        });

        // Check if already active
        if (registration.active) {
          setSwState("active");
        }

        console.log("[ServiceWorker] Registration successful");
      } catch (error) {
        console.error("[ServiceWorker] Registration failed:", error);
        setSwState("error");
      }
    };

    // Delay registration until after page load for better performance
    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker);
      return () => window.removeEventListener("load", registerServiceWorker);
    }
  }, []);

  // Dev mode indicator (optional)
  if (process.env.NODE_ENV === "development" && swState === "error") {
    console.info("[ServiceWorker] Errors in development are normal if using HTTP");
  }

  return null;
}