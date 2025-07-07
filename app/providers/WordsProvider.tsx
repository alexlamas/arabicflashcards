"use client";

import { useCallback, useEffect, useState } from "react";
import { WordService } from "../services/wordService";
import { WordsContext } from "../contexts/WordsContext";
import { Word, WordProgress } from "../types/word";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { supabase } from "../supabase";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useCachedData } from "../hooks/useCachedData";

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [progress, setProgress] = useState<Record<string, WordProgress>>({});
  const isOnline = useOnlineStatus();

  const { loadFromCache, saveToCache } = useCachedData();

  const fetchReviewCount = useCallback(async () => {
    if (!session?.user) {
      setReviewCount(0);
      return;
    }
    
    // Try to fetch from cache if offline
    if (!isOnline) {
      const { reviewCount } = loadFromCache();
      if (reviewCount !== null) {
        setReviewCount(reviewCount);
        return;
      }
    }
    
    try {
      const count = await SpacedRepetitionService.getDueWordsCount(
        session.user.id
      );
      setReviewCount(count);
      saveToCache({ reviewCount: count });
    } catch (err) {
      console.error("Error fetching review count:", err);
      // Fallback to cached count if available
      const { reviewCount } = loadFromCache();
      if (reviewCount !== null) {
        setReviewCount(reviewCount);
      }
    }
  }, [session, isOnline, loadFromCache, saveToCache]);

  const handleWordUpdate = useCallback((updatedWord: Word) => {
    setWords((currentWords) => {
      const updated = currentWords.map((word) =>
        word.id === updatedWord.id ? updatedWord : word
      );
      // Update cache with new words
      saveToCache({ words: updated });
      return updated;
    });
  }, [saveToCache]);

  const handleWordDeleted = async () => {
    try {
      const words = await WordService.getAllWords();
      setWords(words);
      setTotalWords(words.length);
    } catch (error) {
      console.error("Error reloading words:", error);
    }
  };

  const loadCachedData = useCallback(() => {
    const { words: cachedWords, progress: cachedProgress } = loadFromCache();
    
    if (cachedWords) {
      setWords(cachedWords);
      setTotalWords(cachedWords.length);
      if (cachedProgress && session?.user) {
        setProgress(cachedProgress);
      }
      return true;
    }
    return false;
  }, [loadFromCache, session]);

  const fetchProgressForWords = useCallback(async (fetchedWords: Word[]) => {
    if (!session?.user) return;
    
    const wordIds = fetchedWords.map((w) => w.english);
    const progressData = await SpacedRepetitionService.getProgressForWords(
      session.user.id,
      wordIds
    );
    
    const progressMap = progressData.reduce((acc, curr) => {
      acc[curr.word_english] = { ...curr, user_id: session.user.id };
      return acc;
    }, {} as Record<string, WordProgress>);
    
    setProgress(progressMap);
    return progressMap;
  }, [session]);

  const refreshWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // If offline, try to load from cache first
    if (!isOnline) {
      if (loadCachedData()) {
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // Fetch words from API
      const fetchedWords = await WordService.getAllWords();
      setWords(fetchedWords);
      setTotalWords(fetchedWords.length);
      
      // Fetch and set progress if user is authenticated
      const progressMap = await fetchProgressForWords(fetchedWords);
      
      // Cache everything
      saveToCache({ 
        words: fetchedWords, 
        progress: progressMap || undefined 
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
      
      // Try cache as fallback
      if (!loadCachedData()) {
        // Keep error if no cached data available
        console.error("No cached data available", err);
      } else {
        // Clear error since we have cached data
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, loadCachedData, fetchProgressForWords, saveToCache]);

  // Update total words when words change
  useEffect(() => {
    setTotalWords(words.length);
  }, [words]);

  // Initial load and realtime subscriptions
  useEffect(() => {
    refreshWords();
    fetchReviewCount();

    if (!session?.user) return;

    // Consolidated realtime subscription
    const channel = supabase
      .channel("database-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "word_progress",
          filter: `user_id=eq.${session.user.id}`,
        },
        async () => {
          await Promise.all([refreshWords(), fetchReviewCount()]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "words",
        },
        () => {
          refreshWords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, refreshWords, fetchReviewCount]);

  return (
    <WordsContext.Provider
      value={{
        words,
        progress,
        setWords,
        totalWords,
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
