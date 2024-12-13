"use client";

import { useEffect, useState } from "react";
import { WordService } from "../services/wordService";
import { WordsContext } from "../contexts/WordsContext";
import { Word } from "../types/word";
import { useAuth } from "../contexts/AuthContext";

export function WordsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState(0);

  useEffect(() => {
    refreshWords();
  }, [session]);

  const refreshWords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedWords = await WordService.getAllWords();
      setWords(fetchedWords);
      setTotalWords(fetchedWords.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load words");
      console.error("Error loading words:", err);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <WordsContext.Provider
      value={{
        words,
        setWords,
        totalWords,
        isLoading,
        error,
        handleWordDeleted,
        handleWordUpdate,
        refreshWords,
      }}
    >
      {children}
    </WordsContext.Provider>
  );
}
