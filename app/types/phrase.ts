export interface Phrase {
  id?: string;
  arabic?: string;
  transliteration: string;
  english: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  linked_words?: {
    id: string;
    english: string;
    arabic: string;
  }[];
}

export interface WordPhrase {
  id?: string;
  word_id: string;
  phrase_id: string;
  created_at?: string;
}