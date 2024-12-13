// app/contexts/WordsContext.tsx
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { Word } from "../types/word";

type WordsContextType = {
  words: Word[];
  setWords: Dispatch<SetStateAction<Word[]>>;
  totalWords: number;
  isLoading: boolean;
  error: string | null;
  handleWordDeleted: () => Promise<void>;
  handleWordUpdate: (updatedWord: Word) => void;
  refreshWords: () => Promise<void>;
};

export const WordsContext = createContext<WordsContextType>({
  words: [],
  setWords: () => {},
  totalWords: 0,
  isLoading: true,
  error: null,
  handleWordDeleted: async () => {},
  handleWordUpdate: () => {},
  refreshWords: async () => {},
});

export const useWords = () => useContext(WordsContext);
