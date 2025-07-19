export type WordType = "noun" | "verb" | "adjective" | "phrase";

export interface ExampleSentence {
  arabic: string;
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
  // Verb-specific fields: when type is "verb", arabic field contains 3rd person past
  simple_present?: string; // Optional "we do" form for verbs (3rd person plural present)
  simple_present_transliteration?: string; // Transliteration for the simple present form
}
export type ViewMode = "list" | "card" | "flashcard";
export type ProgressState = "learned" | "learning" | "new" | "archived";
export type ProgressMap = Record<string, ProgressState>;

export interface WordProgress {
  word_english: string;
  status: ProgressState;
}
