"use client";

import { useState, useEffect } from "react";
import { WordService } from "./services/wordService";
import { ProgressService } from "./services/progressService";
import { AuthWrapper } from "./components/AuthWrapper";
import type {
  Word,
  ProgressMap,
  SortOption,
  ViewMode,
  WordStats,
} from "./types/word";
import { useFilteredWords } from "./hooks/useFilteredWords";

import WordGrid from "./components/WordGrid";
import { useWordStats } from "./hooks/useWordStats";
import { useFilter } from "./contexts/FilterContext";
import { useAuth } from "./contexts/AuthContext";
import { Header } from "./components/Header";

function HomeContent({ setStats }: { setStats: (stats: WordStats) => void }) {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { progressFilter } = useFilter();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("card");
  const [progress, setProgress] = useState<ProgressMap>({});
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

  useEffect(() => {
    let mounted = true;

    async function loadProgress() {
      try {
        if (!session?.user) {
          if (mounted) {
            setProgress({});
            setLoading(false);
          }
          return;
        }

        const wordProgress = await ProgressService.getProgress();
        if (mounted) {
          const progressMap: ProgressMap = {};
          wordProgress.forEach((item) => {
            progressMap[item.word_english] = item.status;
          });
          setProgress(progressMap);
        }
      } catch (error) {
        console.error("Error loading progress:", error);
        if (mounted) {
          setProgress({});
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProgress();
    return () => {
      mounted = false;
    };
  }, [session]);

  const filteredWords = useFilteredWords({
    words,
    searchTerm,
    progress,
    sortBy,
    progressFilter,
  });

  const stats = useWordStats({
    words,
    filteredWords,
    progress,
  });

  const handleProgressChange = async (newProgress: ProgressMap) => {
    try {
      if (!session?.user) {
        setProgress(newProgress);
        return;
      }

      const changedWord = Object.keys(newProgress).find(
        (word) => newProgress[word] !== progress[word]
      );

      if (!changedWord) return;

      await ProgressService.updateProgress(
        session.user.id,
        changedWord,
        newProgress[changedWord]
      );

      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

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
        <WordGrid
          words={filteredWords}
          view={view}
          progress={progress}
          onProgressChange={handleProgressChange}
        />
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
