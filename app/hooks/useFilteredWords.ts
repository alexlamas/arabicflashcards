import { useMemo } from "react";
import type { Word } from "../types/word";

interface UseFilteredWordsProps {
  words: Word[];
  searchTerm: string;
}

export function useFilteredWords({ words, searchTerm }: UseFilteredWordsProps) {
  return useMemo(() => {
    // First apply search filter
    const filteredWords = words.filter((word) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        !searchTerm ||
        word.english.toLowerCase().includes(searchLower) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchLower)
      );
    });

    return [...filteredWords].sort((a, b) =>
      a.english.localeCompare(b.english)
    );
  }, [words, searchTerm]);
}
