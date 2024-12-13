"use client";

import { useState } from "react";
import { useFilteredWords } from "../hooks/useFilteredWords";
import { useWords } from "../contexts/WordsContext";
import WordGrid from "../components/WordGrid";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { ViewMode } from "../types/word";

function HomeContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    words,
    isLoading: isWordsLoading,
    handleWordDeleted,
    handleWordUpdate,
  } = useWords();

  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("card");

  const filteredWords = useFilteredWords({
    words,
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

export default function Home() {
  return <HomeContent />;
}
