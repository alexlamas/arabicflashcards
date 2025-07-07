"use client";

import { useCallback, useEffect, useState } from "react";
import { useOnlineStatus } from "./useOnlineStatus";
import { CacheService } from "../services/cacheService";
import { Word, WordProgress } from "../types/word";

interface UseOfflineDataOptions<T> {
  cacheKey: "words" | "progress" | "reviewCount";
  fetchFn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  dependencies?: React.DependencyList;
}

export function useOfflineData<T>({
  cacheKey,
  fetchFn,
  onSuccess,
  onError,
  dependencies = [],
}: UseOfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useOnlineStatus();

  const getCachedData = useCallback((): T | null => {
    switch (cacheKey) {
      case "words":
        return CacheService.getWords() as T;
      case "progress":
        return CacheService.getProgress() as T;
      case "reviewCount":
        const count = CacheService.getReviewCount();
        return (count !== null ? count : null) as T;
      default:
        return null;
    }
  }, [cacheKey]);

  const setCachedData = useCallback((data: T) => {
    switch (cacheKey) {
      case "words":
        CacheService.saveWords(data as Word[]);
        break;
      case "progress":
        CacheService.saveProgress(data as Record<string, WordProgress>);
        break;
      case "reviewCount":
        CacheService.saveReviewCount(data as number);
        break;
    }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // If offline, try cache first
    if (!isOnline) {
      const cached = getCachedData();
      if (cached !== null) {
        setData(cached);
        onSuccess?.(cached);
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
      CacheService.setLastSyncTime();
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch data");
      setError(error);
      
      // Try cache as fallback
      const cached = getCachedData();
      if (cached !== null) {
        setData(cached);
        setError(null); // Clear error since we have cached data
        onSuccess?.(cached);
      } else {
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, fetchFn, getCachedData, setCachedData, onSuccess, onError]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...dependencies]);

  return { data, isLoading, error, refetch: fetchData };
}