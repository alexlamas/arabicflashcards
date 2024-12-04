"use client";

import { useState, useEffect } from "react";
import { WordService } from "./services/wordService";
import { ProgressService } from "./services/progressService";
import { SearchBar } from "./components/SearchBar";
import { ViewToggle } from "./components/ViewToggle";
import { AuthWrapper } from "./components/AuthWrapper";
import { SortDropdown } from "./components/SortDropdown";
import type {
  Word,
  ProgressMap,
  SortOption,
  ViewMode,
  WordStats,
} from "./types/word";
import { useFilteredWords } from "./hooks/useFilteredWords";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import WordGrid from "./components/WordGrid";
import { useWordStats } from "./hooks/useWordStats";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AddWordDialog } from "./components/AddWordDialog";
import { useFilter } from "./contexts/FilterContext";
import { useAuth } from "./contexts/AuthContext";

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
          <div className="inline-flex gap-2 items-center">
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
          <TooltipProvider>
            <ViewToggle current={view} onChange={setView} />
          </TooltipProvider>
        </div>
      </header>
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
