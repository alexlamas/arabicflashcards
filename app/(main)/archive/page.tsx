"use client";

import { useState } from "react";
import { useFilteredWords } from "../../hooks/useFilteredWords";
import { useWords } from "../../contexts/WordsContext";
import WordGrid from "../../components/WordGrid";
import { useAuth } from "../../contexts/AuthContext";
import { Header } from "../../components/Header";

function ArchiveContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { words, isLoading: isWordsLoading, handleWordUpdate } = useWords();

  const [searchTerm, setSearchTerm] = useState("");
  const [hideArabic, setHideArabic] = useState(false);

  // Filter for not started (archived) words only
  const archiveWords = words.filter((w) => w.status === "archived");

  const filteredWords = useFilteredWords({
    words: archiveWords,
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
        title="Not Started"
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

export default function ArchivePage() {
  return <ArchiveContent />;
}
