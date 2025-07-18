"use client";

import { useCallback, useEffect, useState } from "react";
import { WordsContext } from "../contexts/WordsContext";
import { Word } from "../types/word";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { supabase } from "../supabase";
import { SyncService } from "../services/syncService";
import { OfflineStorage } from "../services/offlineStorage";
import { getOnlineStatus } from "../utils/connectivity";

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
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
    try {
      let fetchedWords: Word[];
      
      if (getOnlineStatus()) {
        fetchedWords = await SyncService.loadInitialData();
      } else {
        fetchedWords = OfflineStorage.getWords();
      }
      
      // Default undefined/null status to "learning"
      fetchedWords = fetchedWords.map(word => ({
        ...word,
        status: word.status || "learning"
      }));
      
      setWords(fetchedWords);
      setTotalWords(fetchedWords.length);
      
      // Calculate category counts
      const learningWords = fetchedWords.filter(w => w.status === "learning" || !w.status);
      setLearningCount(learningWords.length);
      
      const learnedWords = fetchedWords.filter(w => w.status === "learned");
      setLearnedCount(learnedWords.length);
      
      const archiveWords = fetchedWords.filter(w => w.status === "archived");
      setArchiveCount(archiveWords.length);
      
      fetchReviewCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
      console.error("Error loading words:", err);
      
      let cachedWords = OfflineStorage.getWords();
      if (cachedWords.length > 0) {
        // Default undefined/null status to "learning" for cached words too
        cachedWords = cachedWords.map(word => ({
          ...word,
          status: word.status || "learning"
        }));
        
        setWords(cachedWords);
        setTotalWords(cachedWords.length);
        
        // Calculate category counts for cached words
        const learningWords = cachedWords.filter(w => w.status === "learning" || !w.status);
        setLearningCount(learningWords.length);
        
        const learnedWords = cachedWords.filter(w => w.status === "learned");
        setLearnedCount(learnedWords.length);
        
        const archiveWords = cachedWords.filter(w => w.status === "archived");
        setArchiveCount(archiveWords.length);
        
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchReviewCount]);

  useEffect(() => {
    refreshWords();

    if (!session?.user) return;

    // Set up connectivity listener
    const cleanupConnectivity = SyncService.setupConnectivityListeners();

    // Set up realtime subscription
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
        learningCount,
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
