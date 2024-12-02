// app/hooks/useWordStats.ts
import { useMemo } from 'react';
import type { Word, ProgressMap, WordStats } from '../types/word';

interface UseWordStatsProps {
  words: Word[];
  filteredWords: Word[];
  progress: ProgressMap;
}

export function useWordStats({
  words,
  filteredWords,
  progress,
}: UseWordStatsProps): WordStats {
  return useMemo(() => {

    return {
      total: words.length,
      filtered: filteredWords.length,
      learned: Object.values(progress).filter((p) => p === "learned").length,
      learning: Object.values(progress).filter((p) => p === "learning").length,
      new: words.length - Object.values(progress).length,
    };
  }, [words, filteredWords, progress]);
}