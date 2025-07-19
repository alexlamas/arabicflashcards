"use client";

import { useState } from "react";
import { useFilteredWords } from "../../hooks/useFilteredWords";
import { useWords } from "../../contexts/WordsContext";
import WordGrid from "../../components/WordGrid";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";
import { ViewMode } from "../../types/word";

function ThisWeekContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    words,
    isLoading: isWordsLoading,
    handleWordDeleted,
    handleWordUpdate,
  } = useWords();

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("card");

  // Filter for words with next_review_date within this week, overdue, OR no review date
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const thisWeekWords = words.filter(w => {
    // Exclude archived words
    if (w.status === "archived") return false;
    // Include words without review date (new/unscheduled words)
    if (!w.next_review_date) return true;
    const reviewDate = new Date(w.next_review_date);
    // Include overdue words (past dates) and words due within the next week
    return reviewDate <= oneWeekFromNow;
  });
  
  const filteredWords = useFilteredWords({
    words: thisWeekWords,
    searchTerm,
  });

  if (isAuthLoading || isWordsLoading) {
    return null;
  }

  return (
    <>
      <Header
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        view={view}
        setView={setView}
        title="This Week"
      />
      <div className="p-4">
        <WordGrid
          words={filteredWords}
          view={view}
          onWordDeleted={handleWordDeleted}
          onWordUpdate={handleWordUpdate}
        />
      </div>
    </>
  );
}

export default function ThisWeekPage() {
  return <ThisWeekContent />;
}