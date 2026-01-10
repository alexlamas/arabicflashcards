import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface AIUsageInfo {
  count: number;
  limit: number;
  unlimited: boolean;
}

const AI_USAGE_UPDATED_EVENT = "aiUsageUpdated";

export function useAIUsage() {
  const { session } = useAuth();
  const [usage, setUsage] = useState<AIUsageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!session?.user) {
      setUsage(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/ai-usage", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch usage info");
      }

      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch usage");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // Listen for global refresh events from other components
  useEffect(() => {
    const handleUsageUpdated = () => {
      fetchUsage();
    };

    window.addEventListener(AI_USAGE_UPDATED_EVENT, handleUsageUpdated);
    return () => {
      window.removeEventListener(AI_USAGE_UPDATED_EVENT, handleUsageUpdated);
    };
  }, [fetchUsage]);

  // Refresh function that also notifies other instances
  const refresh = useCallback(() => {
    fetchUsage();
    window.dispatchEvent(new CustomEvent(AI_USAGE_UPDATED_EVENT));
  }, [fetchUsage]);

  const remaining = usage ? usage.limit - usage.count : 0;
  const isLimitReached = usage ? !usage.unlimited && usage.count >= usage.limit : false;

  return {
    usage,
    isLoading,
    error,
    remaining,
    isLimitReached,
    isUnlimited: usage?.unlimited ?? false,
    refresh,
  };
}
