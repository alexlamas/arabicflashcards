import { SearchBar } from "./SearchBar";
import AddWordDialog from "./AddWordDialog";
import React from "react";
import { Session } from "@supabase/supabase-js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewToggle } from "./ViewToggle";
import { Word } from "../types/word";
import { useWords } from "../contexts/WordsContext";
import { clsx } from "clsx";
// import { useUserRoles } from "../hooks/useUserRoles"; // No longer needed - all users can manage their words

interface TabConfig {
  key: string;
  label: string;
  count?: number;
}

export function Header({
  session,
  searchTerm = "",
  setSearchTerm,
  title,
  hideArabic = false,
  setHideArabic,
  tabs,
  activeTab,
  onTabChange,
}: {
  session?: Session | null;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  title?: string;
  hideArabic?: boolean;
  setHideArabic?: (value: boolean) => void;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  // Remove admin checks - all users can manage their own words
  const showSearch = typeof setSearchTerm === "function";
  const { setWords } = useWords();

  const getTabDot = (tabKey: string) => {
    if (tabKey === "learned") {
      return <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />;
    }
    if (tabKey === "learning") {
      return <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />;
    }
    return null;
  };

  return (
    <header className="fixed top-20 -translate-y-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
      <div className="flex items-center gap-2 px-3 pb-3 pt-10 backdrop-blur-lg bg-white/90 border rounded-b-3xl">
      {title && !tabs && <h1 className="font-semibold text-lg mr-4">{title}</h1>}
      {showSearch && (
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      )}
      {tabs && onTabChange && (
        <div className="inline-flex items-center bg-neutral-100 rounded-full p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-full font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-white  shadow-sm text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900"
              } `}
            >
              {getTabDot(tab.key)}
              {tab.label}
              {tab.count !== undefined && (
                <span className={clsx("text-xs pt-0.5",
                  activeTab === tab.key ? "text-neutral-500" : "text-neutral-400"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {(setHideArabic || session) && (
        <div className="inline-flex gap-2 items-center ml-auto">
          {setHideArabic && (
            <TooltipProvider>
              <ViewToggle hideArabic={hideArabic} onChange={setHideArabic} />
            </TooltipProvider>
          )}
          {session && (
            <AddWordDialog
              onWordAdded={(word: Word) => {
                setWords((prevWords) => [...prevWords, word]);
              }}
            />
          )}
        </div>
      )}
      </div>
    </header>
  );
}
