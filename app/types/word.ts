export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface Word {
  id?: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType | string;
  status?: ProgressState;
  next_review_date?: string;
  progress?: {
    status: ProgressState;
    next_review_date: string;
    ease_factor: number;
    interval: number;
    review_count: number;
    success_rate: number;
  }[];
}
export type ViewMode = "list" | "card" | "flashcard";
export type ProgressState = "learned" | "learning" | "new";

export interface WordProgress {
  user_id: string;
  word_english: string;
  status: ProgressState;
  ease_factor: number;
  interval: number;
  review_count: number;
  next_review_date: string | null;
  success_rate: number;
}
