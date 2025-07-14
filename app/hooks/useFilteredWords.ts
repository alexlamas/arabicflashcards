import { useMemo } from "react";
import type { Word } from "../types/word";

export function useFilteredWords({ words, searchTerm }: { words: Word[]; searchTerm: string }) {
  return useMemo(() => {
    if (!searchTerm) return [...words].sort((a, b) => a.english.localeCompare(b.english));
    
    const searchLower = searchTerm.toLowerCase();
    return words
      .filter(word => 
        word.english.toLowerCase().includes(searchLower) ||
        word.arabic.includes(searchTerm) ||
        word.transliteration.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => a.english.localeCompare(b.english));
  }, [words, searchTerm]);
}
