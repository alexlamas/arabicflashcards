"use client";

import { useCallback, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { OfflineStorage } from "../services/offlineStorage";
import { SyncService } from "../services/syncService";
import type { Word } from "../types/word";
import { getOnlineStatus } from "../utils/connectivity";
import { OfflineQueue } from "../services/offlineQueue";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  handleOfflineAction: <T>(
    onlineAction: () => Promise<T>,
    offlineAction: () => void,
    fallbackValue?: T
  ) => Promise<T | undefined>;
  syncNow: () => Promise<void>;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const { session } = useAuth();

  const isOnline = getOnlineStatus();

  const handleOfflineAction = useCallback(
    async <T>(
      onlineAction: () => Promise<T>,
      offlineAction: () => void,
      fallbackValue?: T
    ): Promise<T | undefined> => {
      if (!getOnlineStatus()) {
        offlineAction();
        return fallbackValue;
      }

      try {
        const result = await onlineAction();
        return result;
      } catch {
        offlineAction();
        return fallbackValue;
      }
    },
    []
  );

  const syncNow = useCallback(async () => {
    if (getOnlineStatus() && session?.user) {
      await SyncService.syncPendingActions();
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    const cleanup = SyncService.setupConnectivityListeners();
    
    // Initial sync if online
    if (getOnlineStatus() && OfflineStorage.hasPendingActions()) {
      SyncService.syncPendingActions();
    }

    return cleanup;
  }, [session]);

  return {
    isOnline,
    handleOfflineAction,
    syncNow,
  };
}

// Helper to calculate next review date based on rating
function calculateNextReview(rating: number): { status: string; nextReviewDate: Date } {
  const now = new Date();
  const nextReviewDate = new Date();
  
  // Simple algorithm for offline calculation
  if (rating === 0) {
    // Again - review in 6 hours
    nextReviewDate.setHours(now.getHours() + 6);
  } else if (rating === 1) {
    // Hard - review in 1 day
    nextReviewDate.setDate(now.getDate() + 1);
  } else if (rating === 2) {
    // Good - review in 3 days
    nextReviewDate.setDate(now.getDate() + 3);
  } else {
    // Easy - review in 7 days
    nextReviewDate.setDate(now.getDate() + 7);
  }
  
  return {
    status: rating >= 2 ? "learned" : "learning",
    nextReviewDate,
  };
}

// Helper functions for common offline operations
export const offlineHelpers = {
  deleteWord: (wordId: string) => {
    OfflineStorage.deleteWord(wordId);
    OfflineStorage.addAction(OfflineQueue.createDeleteAction(wordId));
  },

  updateWord: (wordId: string, updates: Partial<Word>) => {
    // Filter out undefined values to prevent sync issues
    const cleanUpdates = Object.entries(updates).reduce<Partial<Word>>((acc, [key, value]) => {
      if (value !== undefined && key in updates) {
        return { ...acc, [key]: value };
      }
      return acc;
    }, {});
    
    if (Object.keys(cleanUpdates).length > 0) {
      OfflineStorage.updateWord(wordId, cleanUpdates);
      OfflineStorage.addAction(OfflineQueue.createUpdateAction(wordId, cleanUpdates));
    }
  },

  startLearning: (userId: string, wordId: string) => {
    // Queue the START_LEARNING action for sync
    OfflineStorage.addAction(OfflineQueue.createStartLearningAction(userId, wordId));
  },

  updateProgress: (userId: string, wordId: string, rating: number) => {
    const words = OfflineStorage.getWords();
    const wordIndex = words.findIndex(w => w.id === wordId);

    if (wordIndex !== -1) {
      const { status, nextReviewDate } = calculateNextReview(rating);
      const updatedWord = {
        ...words[wordIndex],
        status: status as "learned" | "learning" | "new",
        next_review_date: nextReviewDate.toISOString(),
      };
      OfflineStorage.updateWord(words[wordIndex].id!, updatedWord);
    }

    OfflineStorage.addAction(OfflineQueue.createProgressAction(userId, wordId, rating));
  },
};