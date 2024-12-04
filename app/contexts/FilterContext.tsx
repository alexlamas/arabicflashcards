import { createContext, useContext } from "react";

type FilterContextType = {
  progressFilter: "learning" | "learned" | "all" | null;
  setProgressFilter: (filter: "learning" | "learned" | "all" | null) => void;
};

export const FilterContext = createContext<FilterContextType>({
  progressFilter: null,
  setProgressFilter: () => {},
});

export const useFilter = () => useContext(FilterContext);
