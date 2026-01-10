"use client";

import { useState } from "react";
import { useFilteredWords } from "../../hooks/useFilteredWords";
import { useWords } from "../../contexts/WordsContext";
import WordGrid from "../../components/WordGrid";
import { useAuth } from "../../contexts/AuthContext";
import { SubNav, TabConfig } from "../../components/SubNav";
import { ViewToggle } from "../../components/ViewToggle";
import AddWordDialog from "../../components/AddWordDialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Word } from "../../types/word";

type FilterTab = "all" | "learning" | "learned";

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

  // Filter based on active tab
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const tabFilteredWords = words.filter(w => {
    if (activeTab === "all") return true;

    if (activeTab === "learned") {
      if (!w.next_review_date) return false;
      const reviewDate = new Date(w.next_review_date);
      return reviewDate > oneMonthFromNow;
    }

    // learning - words not yet "learned"
    if (!w.next_review_date) return true;
    const reviewDate = new Date(w.next_review_date);
    return reviewDate <= oneMonthFromNow;
  });

  const filteredWords = useFilteredWords({
    words: tabFilteredWords,
    searchTerm,
  });

  // Count for badges
  const learnedCount = words.filter(w => {
    if (!w.next_review_date) return false;
    const reviewDate = new Date(w.next_review_date);
    return reviewDate > oneMonthFromNow;
  }).length;
  const learningCount = words.length - learnedCount;

  if (isAuthLoading || isWordsLoading) {
    return null;
  }

  const tabs: TabConfig[] = [
    { key: "all", label: "All", count: words.length },
    { key: "learning", label: "Learning", count: learningCount, dot: "learning" },
    { key: "learned", label: "Learned", count: learnedCount, dot: "learned" },
  ];

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
          words={filteredWords}
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
