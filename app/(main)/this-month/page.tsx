"use client";

import { useState } from "react";
import { useFilteredWords } from "../../hooks/useFilteredWords";
import { useWords } from "../../contexts/WordsContext";
import WordGrid from "../../components/WordGrid";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";

function ThisMonthContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    words,
    isLoading: isWordsLoading,
    handleWordUpdate,
  } = useWords();

  const [searchTerm, setSearchTerm] = useState("");
  const [hideArabic, setHideArabic] = useState(false);

  // Filter for words with next_review_date within this month (but beyond this week)
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const thisMonthWords = words.filter(w => {
    if (!w.next_review_date) return false;
    const reviewDate = new Date(w.next_review_date);
    return reviewDate > oneWeekFromNow && reviewDate <= oneMonthFromNow;
  });
  
  const filteredWords = useFilteredWords({
    words: thisMonthWords,
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
        hideArabic={hideArabic}
        setHideArabic={setHideArabic}
        title="This Month"
      />
      <div className="p-4">
        <WordGrid
          words={filteredWords}
          hideArabic={hideArabic}
          onWordUpdate={handleWordUpdate}
        />
      </div>
    </>
  );
}

export default function ThisMonthPage() {
  return <ThisMonthContent />;
}