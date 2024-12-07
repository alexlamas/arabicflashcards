import { Tag } from "../services/tagService";

export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface Word {
  id?: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType | string;
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
