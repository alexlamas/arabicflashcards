"use client";

import { useCallback, useEffect, useState } from "react";
import { WordsContext } from "../contexts/WordsContext";
import { Word } from "../types/word";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { createClient } from "@/utils/supabase/client";
import { SyncService } from "../services/syncService";
import { OfflineStorage } from "../services/offlineStorage";
import { getOnlineStatus } from "../utils/connectivity";

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [weekCount, setWeekCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [archiveCount, setArchiveCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const fetchReviewCount = useCallback(async () => {
    if (!session?.user) {
      setReviewCount(0);
      return;
    }
    try {
      const count = await SpacedRepetitionService.getDueWordsCount(
        session.user.id
      );
      setReviewCount(count);
    } catch (err) {
      console.error("Error fetching review count:", err);
    }
  }, [session]);

  const handleWordUpdate = (updatedWord: Word) => {
    setWords((currentWords) =>
      currentWords.map((word) =>
        word.id === updatedWord.id ? updatedWord : word
      )
    );
  };

  const handleWordDeleted = async (wordId?: string) => {
    if (wordId) {
      setWords((currentWords) => currentWords.filter((w) => w.id !== wordId));
    } else {
      await refreshWords();
    }
  };

  const refreshWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Set user ID for offline storage
    if (session?.user?.id) {
      OfflineStorage.setUserId(session.user.id);
    }
    
    try {
      let fetchedWords: Word[];
      
      if (getOnlineStatus()) {
        fetchedWords = await SyncService.loadInitialData();
      } else {
        fetchedWords = OfflineStorage.getWords();
      }
      
      // Default undefined/null status to "archived"
      fetchedWords = fetchedWords.map(word => ({
        ...word,
        status: word.status || "archived"
      }));
      
      setWords(fetchedWords);
      setTotalWords(fetchedWords.length);
      
      // Calculate category counts based on next_review_date
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      // First separate archived words
      const archiveWords = fetchedWords.filter(w => w.status === "archived");
      setArchiveCount(archiveWords.length);
      
      // Work with non-archived words only
      const activeWords = fetchedWords.filter(w => w.status !== "archived");
      
      // Words without next_review_date, overdue, or due within a week should be included in "this week"
      const weekWords = activeWords.filter(w => {
        if (!w.next_review_date) return true; // Include words without review date
        const reviewDate = new Date(w.next_review_date);
        // Include overdue words (past dates) and words due within the next week
        return reviewDate <= oneWeekFromNow;
      });
      setWeekCount(weekWords.length);
      
      const monthWords = activeWords.filter(w => {
        if (!w.next_review_date) return false;
        const reviewDate = new Date(w.next_review_date);
        return reviewDate > oneWeekFromNow && reviewDate <= oneMonthFromNow;
      });
      setMonthCount(monthWords.length);
      
      const learnedWords = activeWords.filter(w => {
        if (!w.next_review_date) return false;
        const reviewDate = new Date(w.next_review_date);
        return reviewDate > oneMonthFromNow;
      });
      setLearnedCount(learnedWords.length);
      
      fetchReviewCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
      console.error("Error loading words:", err);
      
      let cachedWords = OfflineStorage.getWords();
      if (cachedWords.length > 0) {
        // Default undefined/null status to "archived" for cached words too
        cachedWords = cachedWords.map(word => ({
          ...word,
          status: word.status || "archived"
        }));
        
        setWords(cachedWords);
        setTotalWords(cachedWords.length);
        
        // Calculate category counts for cached words based on next_review_date
        const now = new Date();
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        // First separate archived words
        const archiveWords = cachedWords.filter(w => w.status === "archived");
        setArchiveCount(archiveWords.length);
        
        // Work with non-archived words only
        const activeWords = cachedWords.filter(w => w.status !== "archived");
        
        // Words without next_review_date, overdue, or due within a week should be included in "this week"
        const weekWords = activeWords.filter(w => {
          if (!w.next_review_date) return true; // Include words without review date
          const reviewDate = new Date(w.next_review_date);
          // Include overdue words (past dates) and words due within the next week
          return reviewDate <= oneWeekFromNow;
        });
        setWeekCount(weekWords.length);
        
        const monthWords = activeWords.filter(w => {
          if (!w.next_review_date) return false;
          const reviewDate = new Date(w.next_review_date);
          return reviewDate > oneWeekFromNow && reviewDate <= oneMonthFromNow;
        });
        setMonthCount(monthWords.length);
        
        const learnedWords = activeWords.filter(w => {
          if (!w.next_review_date) return false;
          const reviewDate = new Date(w.next_review_date);
          return reviewDate > oneMonthFromNow;
        });
        setLearnedCount(learnedWords.length);
        
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReviewCount]);

  useEffect(() => {
    // Set user ID for offline storage when session changes
    if (session?.user?.id) {
      OfflineStorage.setUserId(session.user.id);
    } else {
      OfflineStorage.setUserId(null);
    }
    
    refreshWords();

    if (!session?.user) return;

    // Set up connectivity listener
    const cleanupConnectivity = SyncService.setupConnectivityListeners();

    // Set up realtime subscription
    const supabase = createClient();
    const channel = supabase
      .channel("word-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_progress",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          refreshWords();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "words",
          filter: `user_id=eq.${session.user.id}`,
        },
        () => {
          refreshWords();
        }
      )
      .subscribe();

    // Initial sync if online
    if (getOnlineStatus()) {
      SyncService.syncPendingActions();
    }

    return () => {
      supabase.removeChannel(channel);
      cleanupConnectivity();
    };
  }, [session, refreshWords]);

  return (
    <WordsContext.Provider
      value={{
        words,
        setWords,
        totalWords,
        weekCount,
        monthCount,
        learnedCount,
        archiveCount,
        isLoading,
        error,
        handleWordDeleted,
        handleWordUpdate,
        refreshWords,
        reviewCount,
        fetchReviewCount,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
}
