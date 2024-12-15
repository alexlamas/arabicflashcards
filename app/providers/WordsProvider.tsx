"use client";

import { useCallback, useEffect, useState } from "react";
import { WordService } from "../services/wordService";
import { WordsContext } from "../contexts/WordsContext";
import { Word, WordProgress } from "../types/word";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { supabase } from "../supabase";

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [progress, setProgress] = useState<Record<string, WordProgress>>({});

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

  const handleWordDeleted = async () => {
    try {
      const words = await WordService.getAllWords();
      setWords(words);
    } catch (error) {
      console.error("Error reloading words:", error);
    }
  };

  const refreshWords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // First get all words
      const fetchedWords = await WordService.getAllWords();
      setWords(fetchedWords);

      // Then get progress if user is logged in
      if (session?.user) {
        const wordIds = fetchedWords.map((w) => w.english);
        const progressData = await SpacedRepetitionService.getProgressForWords(
          session.user.id,
          wordIds
        );

        // Convert to lookup object
        const progressMap = progressData.reduce((acc, curr) => {
          acc[curr.word_english] = { ...curr, user_id: session.user.id };
          return acc;
        }, {} as Record<string, WordProgress>);

        setProgress(progressMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    refreshWords();

    if (!session?.user) return;

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, refreshWords]);

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
