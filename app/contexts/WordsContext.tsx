// app/contexts/WordsContext.tsx
import { createContext, useContext } from "react";

type WordsContextType = {
  totalWords: number;
  setTotalWords: (count: number) => void;
};

export const WordsContext = createContext<WordsContextType>({
  totalWords: 0,
  setTotalWords: () => {},
});

export const useWords = () => useContext(WordsContext);
