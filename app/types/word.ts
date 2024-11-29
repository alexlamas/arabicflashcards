export interface Word {
  english: string;
  arabic: string;
  transliteration: string;
  category: string;
  type: string;
}

export type ProgressState = "learned" | "learning" | "new";
export type ProgressMap = Record<string, ProgressState>;

export interface WordProgress {
  word_english: string;
  status: ProgressState;
}

export interface WordStats {
  total: number;
  filtered: number;
  learned: number;
  learning: number;
  new: number;
  byCategory: Record<string, number>;
}

export type SortOption = "alphabetical" | "progress" | "type";
export type ViewMode = "list" | "flashcard";