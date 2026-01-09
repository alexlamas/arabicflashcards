import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "./SearchBar";
import AddWordDialog from "./AddWordDialog";
import React from "react";
import { Session } from "@supabase/supabase-js";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewToggle } from "./ViewToggle";
import { Word } from "../types/word";
import ReviewTimeline from "./review/ReviewTimeline";
import { useWords } from "../contexts/WordsContext";
// import { useUserRoles } from "../hooks/useUserRoles"; // No longer needed - all users can manage their words

interface TabConfig {
  key: string;
  label: string;
  count?: number;
}

export function Header({
  variant = "default",
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
  variant?: "default" | "review";
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

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-xs px-4 sticky top-0 backdrop-blur-lg bg-white/70 z-30 ">
      {session && (
        <>
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </>
      )}
      {title && !tabs && <h1 className="font-semibold text-lg mr-4">{title}</h1>}
      {tabs && onTabChange && (
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                activeTab === tab.key
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
            </button>
          ))}
        </div>
      )}
      {variant === "review" && <ReviewTimeline />}
      {showSearch && (
        <>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </>
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
    </header>
  );
}
