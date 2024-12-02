import { useMemo } from 'react';
import type { Word, ProgressMap, SortOption } from '../types/word';
import { Tag } from '../services/tagService';

interface UseFilteredWordsProps {
  words: Word[];
  searchTerm: string;
  selectedTags: Tag[];  
  progress: ProgressMap;
  sortBy: SortOption;
}

export function useFilteredWords({
  words,
  searchTerm,
  selectedTags,
  progress,
  sortBy,
}: UseFilteredWordsProps) {
  return useMemo(() => {
    const filteredWords = words.filter((word) => {
      const matchesSearch = !searchTerm ||
        word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => word.tags?.some(wordTag => wordTag.id === tag.id));
      
      return matchesSearch && matchesTags;
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
  }, [words, searchTerm,selectedTags, progress, sortBy]);
}