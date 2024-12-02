// app/types/word.ts

import { Tag } from "../services/tagService";

export type WordType = 'noun' | 'verb' | 'adjective' | 'phrase';

export interface Word {
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType;
  tags?: Tag[];
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
}

export type SortOption = "alphabetical" | "progress" | "type";
export type ViewMode = "list" | "card" | "flashcard";