"use client";

import { useCallback } from "react";
import { CacheService } from "../services/cacheService";
import { Word, WordProgress } from "../types/word";

interface CacheOperations {
  loadFromCache: () => {
    words: Word[] | null;
    progress: Record<string, WordProgress> | null;
    reviewCount: number | null;
  };
  saveToCache: (data: {
    words?: Word[];
    progress?: Record<string, WordProgress>;
    reviewCount?: number;
  }) => void;
}

export function useCachedData(): CacheOperations {
  const loadFromCache = useCallback(() => {
    return {
      words: CacheService.getWords(),
      progress: CacheService.getProgress(),
      reviewCount: CacheService.getReviewCount(),
    };
  }, []);

  const saveToCache = useCallback((data: {
    words?: Word[];
    progress?: Record<string, WordProgress>;
    reviewCount?: number;
  }) => {
    if (data.words) {
      CacheService.saveWords(data.words);
    }
    if (data.progress) {
      CacheService.saveProgress(data.progress);
    }
    if (data.reviewCount !== undefined) {
      CacheService.saveReviewCount(data.reviewCount);
    }
    CacheService.setLastSyncTime();
  }, []);

  return { loadFromCache, saveToCache };
}