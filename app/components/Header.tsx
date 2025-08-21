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

export function Header({
  variant = "default",
  session,
  searchTerm = "",
  setSearchTerm,
  title,
  hideArabic = false,
  setHideArabic,
}: {
  variant?: "default" | "review";
  session?: Session | null;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  title?: string;
  hideArabic?: boolean;
  setHideArabic?: (value: boolean) => void;
}) {
  const isAdmin = session?.user.email === "lamanoujaim@gmail.com";
  const showSearch = typeof setSearchTerm === "function";
  const { setWords } = useWords();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-xs px-4 sticky top-0 backdrop-blur-lg bg-white/70 z-30 ">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      {title && <h1 className="font-semibold hidden text-lg mr-4">{title}</h1>}
      {variant === "review" && <ReviewTimeline />}
      {showSearch && (
        <>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </>
      )}

      {setHideArabic && isAdmin && (
        <div className="inline-flex gap-2 items-center ml-auto">
          <TooltipProvider>
            <ViewToggle hideArabic={hideArabic} onChange={setHideArabic} />
          </TooltipProvider>
          {isAdmin && setWords && (
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
