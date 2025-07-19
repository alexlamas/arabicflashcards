// app/contexts/WordsContext.tsx
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Word } from "../types/word";

type WordsContextType = {
  words: Word[];
  setWords: Dispatch<SetStateAction<Word[]>>;
  totalWords: number;
  weekCount: number;
  monthCount: number;
  learnedCount: number;
  archiveCount: number;
  isLoading: boolean;
  error: string | null;
  handleWordDeleted: (wordId?: string) => Promise<void>;
  handleWordUpdate: (updatedWord: Word) => void;
  refreshWords: () => Promise<void>;
  reviewCount: number;
  fetchReviewCount: () => Promise<void>;
};

export const WordsContext = createContext<WordsContextType>({
  words: [],
  setWords: () => {},
  totalWords: 0,
  weekCount: 0,
  monthCount: 0,
  learnedCount: 0,
  archiveCount: 0,
  isLoading: true,
  error: null,
  handleWordDeleted: async () => {},
  handleWordUpdate: () => {},
  refreshWords: async () => {},
  reviewCount: 0,
  fetchReviewCount: async () => {},
});

export const useWords = () => useContext(WordsContext);
