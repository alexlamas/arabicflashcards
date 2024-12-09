import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SearchBar } from "./SearchBar";
import { AddWordDialog } from "./AddWordDialog";

import React from "react";
import { Session } from "@supabase/supabase-js";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewToggle } from "./ViewToggle";
import { ViewMode, Word } from "../types/word";

export function Header({
  session,
  searchTerm,
  setSearchTerm,
  setWords,
  view,
  setView,
}: {
  session: Session | null;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
  view: ViewMode;
  setView: (ViewMode: ViewMode) => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <SearchBar value={searchTerm} onChange={setSearchTerm} />
      {session && (
        <AddWordDialog
          onWordAdded={(word) => {
            setWords((prevWords) => [...prevWords, word]);
          }}
        />
      )}

      <div className="inline-flex gap-2 items-center ml-auto">
        <TooltipProvider>
          <ViewToggle current={view} onChange={setView} />
        </TooltipProvider>
      </div>
    </header>
  );
}
