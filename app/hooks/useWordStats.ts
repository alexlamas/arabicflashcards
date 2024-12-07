// app/hooks/useWordStats.ts
import { useMemo } from "react";
import type { Word, WordStats } from "../types/word";

interface UseWordStatsProps {
  words: Word[];
  filteredWords: Word[];
}

export function useWordStats({
  words,
  filteredWords,
}: UseWordStatsProps): WordStats {
  return useMemo(() => {
    return {
      total: words.length,
      filtered: filteredWords.length,
    };
  }, [words, filteredWords]);
}
