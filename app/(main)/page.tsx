"use client";

import { useState, useEffect } from "react";
import { WordService } from "../services/wordService";
import type { Word, ViewMode } from "../types/word";
import { useFilteredWords } from "../hooks/useFilteredWords";
import { useWords } from "../contexts/WordsContext";
import WordGrid from "../components/WordGrid";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";

function HomeContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("card");
  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState<Word[]>([]);
  const { setTotalWords } = useWords();

  const handleWordDeleted = async () => {
    try {
      const words = await WordService.getAllWords();
      setWords(words);
    } catch (error) {
      console.error("Error reloading words:", error);
    }
  };

  const handleWordUpdate = (updatedWord: Word) => {
    setWords((currentWords) =>
      currentWords.map((word) =>
        word.id === updatedWord.id ? updatedWord : word
      )
    );
  };

  useEffect(() => {
    async function loadWords() {
      try {
        const words = await WordService.getAllWords();
        setWords(words);
        setTotalWords(words.length);
      } catch (error) {
        console.error("Error loading words:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWords();
  }, [setTotalWords]);

  const filteredWords = useFilteredWords({
    words,
    searchTerm,
  });

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
