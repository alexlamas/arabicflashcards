"use client";

import { useState, useEffect } from "react";
import { WordService } from "./services/wordService";
import { AuthWrapper } from "./components/AuthWrapper";
import type { Word, ViewMode, WordStats } from "./types/word";
import { useFilteredWords } from "./hooks/useFilteredWords";

import WordGrid from "./components/WordGrid";
import { useWordStats } from "./hooks/useWordStats";
import { useAuth } from "./contexts/AuthContext";
import { Header } from "./components/Header";
import { SortOption } from "./components/SortDropdown";

function HomeContent({ setStats }: { setStats: (stats: WordStats) => void }) {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("card");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    async function loadWords() {
      try {
        const words = await WordService.getAllWords();
        setWords(words);
      } catch (error) {
        console.error("Error loading words:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, []);

  const filteredWords = useFilteredWords({
    words,
    searchTerm,
    sortBy,
  });

  const stats = useWordStats({
    words,
    filteredWords,
  });

  useEffect(() => {
    setStats(stats);
  }, [stats, setStats]);

  if (isAuthLoading || loading) {
    return null;
  }

  return (
    <>
      <Header
        session={session}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setWords={setWords}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
      />
      <div className="p-4">
        <WordGrid words={filteredWords} view={view} />
      </div>
    </>
  );
}

export default function Home() {
  const [stats, setStats] = useState<WordStats>({} as WordStats);

  return (
    <AuthWrapper stats={stats}>
      <HomeContent setStats={setStats} />
    </AuthWrapper>
  );
}
