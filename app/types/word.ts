export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface ExampleSentence {
  arabic?: string;
  transliteration: string;
  english: string;
}

export interface Word {
  id?: string;
  english: string;
  arabic: string;
  transliteration: string;
  type: WordType | string;
  status?: ProgressState;
  next_review_date?: string;
  example_sentences?: ExampleSentence[];
  notes?: string;
}
export type ViewMode = "list" | "card" | "flashcard";
export type ProgressState = "learned" | "learning" | "new" | "archived";
export type ProgressMap = Record<string, ProgressState>;

export interface WordProgress {
  word_english: string;
  status: ProgressState;
}
