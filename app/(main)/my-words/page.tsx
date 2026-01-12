"use client";

import { useState, useMemo } from "react";
import { useFilteredWords } from "../../hooks/useFilteredWords";
import { useWords } from "../../contexts/WordsContext";
import WordGrid from "../../components/WordGrid";
import { useAuth } from "../../contexts/AuthContext";
import { SubNav, TabConfig } from "../../components/SubNav";
import { ViewToggle } from "../../components/ViewToggle";
import AddWordDialog from "../../components/AddWordDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Word } from "../../types/word";
import { CardsThree, SortAscending, Check } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type FilterTab = "all" | "learning" | "learned";
type SortOption = "alphabetical" | "recent" | "review";

function MyWordsContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    words: allWords,
    isLoading: isWordsLoading,
    handleWordUpdate,
    setWords,
  } = useWords();

  // Only show custom words (not pack words)
  const words = allWords.filter(w => !w.pack_id);

  const [searchTerm, setSearchTerm] = useState("");
  const [hideArabic, setHideArabic] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const LEARNED_INTERVAL_THRESHOLD = 7; // days

  // Filter based on active tab using interval as source of truth
  const tabFilteredWords = words.filter(w => {
    if (activeTab === "all") return true;

    const isLearned = w.interval && w.interval >= LEARNED_INTERVAL_THRESHOLD;

    if (activeTab === "learned") {
      return isLearned;
    }

    // learning - words not yet at the learned threshold
    return !isLearned;
  });

  const filteredWords = useFilteredWords({
    words: tabFilteredWords,
    searchTerm,
  });

  // Sort the filtered words
  const sortedWords = useMemo(() => {
    const sorted = [...filteredWords];
    switch (sortBy) {
      case "alphabetical":
        sorted.sort((a, b) => a.english.localeCompare(b.english));
        break;
      case "recent":
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA; // Most recent first
        });
        break;
      case "review":
        sorted.sort((a, b) => {
          const dateA = a.next_review_date ? new Date(a.next_review_date).getTime() : Infinity;
          const dateB = b.next_review_date ? new Date(b.next_review_date).getTime() : Infinity;
          return dateA - dateB; // Soonest review first
        });
        break;
    }
    return sorted;
  }, [filteredWords, sortBy]);

  // Count for badges using interval as source of truth
  const learnedCount = words.filter(w => w.interval && w.interval >= LEARNED_INTERVAL_THRESHOLD).length;
  const learningCount = words.length - learnedCount;

  if (isAuthLoading || isWordsLoading) {
    return null;
  }

  const tabs: TabConfig[] = [
    { key: "all", label: "All", count: words.length },
    { key: "learning", label: "Learning", count: learningCount, dot: "learning" },
    { key: "learned", label: "Learned", count: learnedCount, dot: "learned" },
  ];

  if (words.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 px-9 pt-24">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <CardsThree className="w-8 h-8 text-disabled" />
          </div>
          <h3 className="font-medium text-heading mb-1">No words yet</h3>
          <p className="text-sm text-body mb-4 max-w-xs">
            Add your own words and expressions to build a personal vocabulary list.
          </p>
          {session && (
            <AddWordDialog
              onWordAdded={(word: Word) => {
                setWords((prevWords) => [...prevWords, word]);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SubNav
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as FilterTab)}
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <SortAscending className="h-5 w-5" weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                  <Check className={`h-4 w-4 mr-2 ${sortBy === "alphabetical" ? "opacity-100" : "opacity-0"}`} />
                  Alphabetical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  <Check className={`h-4 w-4 mr-2 ${sortBy === "recent" ? "opacity-100" : "opacity-0"}`} />
                  Recently added
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("review")}>
                  <Check className={`h-4 w-4 mr-2 ${sortBy === "review" ? "opacity-100" : "opacity-0"}`} />
                  Review date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <TooltipProvider>
              <ViewToggle hideArabic={hideArabic} onChange={setHideArabic} />
            </TooltipProvider>
            {session && (
              <AddWordDialog
                onWordAdded={(word: Word) => {
                  setWords((prevWords) => [...prevWords, word]);
                }}
              />
            )}
          </>
        }
      />
      <div className="p-4 px-9 pt-24">
        <WordGrid
          words={sortedWords}
          hideArabic={hideArabic}
          onWordUpdate={handleWordUpdate}
        />
      </div>
    </div>
  );
}

export default function MyWordsPage() {
  return <MyWordsContent />;
}
