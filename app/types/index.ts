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