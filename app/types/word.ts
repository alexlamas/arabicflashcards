// app/types/word.ts

export type WordType = 'noun' | 'verb' | 'adjective' | 'phrase';

export type WordCategory = 
  | 'Personal Qualities & Emotions'
  | 'Actions & Verbs'
  | 'Daily Life'
  | 'Weather & Environment'
  | 'Leisure & Hobbies'
  | 'Modern Issues';

export interface Word {
  tags: any;
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  category: WordCategory;
  type: WordType;
  created_at?: string;
  updated_at?: string;
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
export type ViewMode = "list" | "card" | "flashcard";