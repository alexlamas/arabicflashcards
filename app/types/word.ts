import { Tag } from "../services/tagService";

export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface Word {
  word_english: string;
  id?: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType | string;
  interval?: number;
  ease_factor?: number;
  review_count?: number;
  next_review_date?: string;
  tags?: Tag[];
}
export type ViewMode = "list" | "card" | "flashcard";
export type ProgressState = "learned" | "learning" | "new";
export type ProgressMap = Record<string, ProgressState>;

export interface WordProgress {
  word_english: string;
  status: ProgressState;
}

export interface WordStats {
  total: number;
  filtered: number;
}
