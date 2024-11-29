import { useMemo } from 'react';
import type { Word, ProgressMap, WordStats } from '../types/word';

interface UseWordStatsProps {
  words: Word[];
  filteredWords: Word[];
  progress: ProgressMap;
  categories: string[];
}

export function useWordStats({
  words,
  filteredWords,
  progress,
  categories,
}: UseWordStatsProps): WordStats {
  return useMemo(() => ({
    total: words.length,
    filtered: filteredWords.length,
    learned: Object.values(progress).filter((p) => p === "learned").length,
    learning: Object.values(progress).filter((p) => p === "learning").length,
    new: words.length - Object.values(progress).length,
    byCategory: categories.reduce(
      (acc, cat) => ({
        ...acc,
        [cat]: words.filter((w) => w.category === cat).length,
      }),
      {} as Record<string, number>
    ),
  }), [words, filteredWords, progress, categories]);
}