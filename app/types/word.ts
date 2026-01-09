export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface Sentence {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  notes?: string | null;
  user_id?: string | null;
  pack_id?: string | null;
  created_at?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

// For creating/editing sentences (without id)
export interface SentenceInput {
  arabic?: string;
  transliteration: string;
  english: string;
}

export interface Word {
  id: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType | string;
  status?: ProgressState;
  next_review_date?: string;
  notes?: string;
  pack_id?: string | null;
  user_id?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

export type ProgressState = "learned" | "learning" | "new";
export type ProgressMap = Record<string, ProgressState>;

export interface WordProgress {
  word_id: string;
  status: ProgressState;
}
