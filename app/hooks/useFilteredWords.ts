import { useMemo } from 'react';
import type { Word, ProgressMap, SortOption } from '../types/word';

interface UseFilteredWordsProps {
  words: Word[];
  searchTerm: string;
  progress: ProgressMap;
  sortBy: SortOption;
  progressFilter?: 'learning' | 'learned' | 'all' | null;
}

export function useFilteredWords({
  words,
  searchTerm,
  progress,
  sortBy,
  progressFilter
}: UseFilteredWordsProps) {
  return useMemo(() => {
    const filteredWords = words.filter((word) => {
      // First apply search filter
      const matchesSearch = !searchTerm ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Then apply progress filter if one is set
      if (!progressFilter || progressFilter === 'all') {
        return matchesSearch;
      }
      
      const wordProgress = progress[word.english] || 'new';
      if (progressFilter === 'learning' && wordProgress === 'learning') {
        return matchesSearch;
      }
      if (progressFilter === 'learned' && wordProgress === 'learned') {
        return matchesSearch;
      }
      
      return false;
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
  }, [words, searchTerm, progress, sortBy, progressFilter]);
}