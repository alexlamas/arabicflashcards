import { useMemo } from "react";
import type { Word } from "../types/word";
import { SortOption } from "../components/SortDropdown";

interface UseFilteredWordsProps {
  words: Word[];
  searchTerm: string;
  sortBy: SortOption;
}

export function useFilteredWords({
  words,
  searchTerm,
  sortBy,
}: UseFilteredWordsProps) {
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

    // Then sort the filtered results
    return [...filteredWords].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.english.localeCompare(b.english);
        case "type":
          return a.type.localeCompare(b.type);

        default:
          return 0;
      }
    });
  }, [words, searchTerm, sortBy]);
}
