"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { getOnlineStatus } from "../utils/connectivity";

export function useOfflineNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((path: string) => {
    // If we're already on the target path, do nothing
    if (window.location.pathname === path) {
      return;
    }

    startTransition(() => {
      try {
        // Always try router first - it will handle offline gracefully with service worker
        router.push(path);
      } catch (error) {
        console.error("Navigation error:", error);
        // Only use location.href as last resort
        if (!getOnlineStatus()) {
          window.location.href = path;
        }
      }
    });
  }, [router]);

  return { navigate, isNavigating: isPending };
}