// app/hooks/useWordStats.ts
import { useMemo } from "react";
import type { Word, WordStats } from "../types/word";

interface UseWordStatsProps {
  words: Word[];
}

export function useWordStats({ words }: UseWordStatsProps): WordStats {
  return useMemo(() => {
    return {
      total: words.length,
    };
  }, [words]);
}
