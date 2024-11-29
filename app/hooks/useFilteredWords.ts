import { useMemo } from 'react';
import type { Word, ProgressMap, SortOption } from '../types/word';

interface UseFilteredWordsProps {
  words: Word[];
  searchTerm: string;
  selectedCategory: string | null;
  progress: ProgressMap;
  sortBy: SortOption;
}

export function useFilteredWords({
  words,
  searchTerm,
  selectedCategory,
  progress,
  sortBy,
}: UseFilteredWordsProps) {
  return useMemo(() => {
    const filteredWords = words.filter((word) => {
      const matchesCategory =
        !selectedCategory || word.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return [...filteredWords].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.english.localeCompare(b.english);
        case "progress": {
          const progressOrder = { learned: 0, learning: 1, new: 2 };
          const aProgress = progress[a.english] || "new";
          const bProgress = progress[b.english] || "new";
          return progressOrder[aProgress] - progressOrder[bProgress];
        }
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  }, [words, searchTerm, selectedCategory, progress, sortBy]);
}