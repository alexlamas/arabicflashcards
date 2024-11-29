"use client";

import { useState, useEffect, useMemo } from "react";
import wordsData from "./data/words.json";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { WordGrid } from "./components/WordGrid";
import { Stats } from "./components/Stats";
import { ViewToggle } from "./components/ViewToggle";
import { AuthWrapper, useAuth } from "./components/AuthWrapper";
import ArabicKeyboard from "./components/ArabicKeyboard";
import { SortDropdown } from "./components/SortDropdown";
import { WordService } from "./services/supabaseService";
import { useFilteredWords } from "./hooks/useFilteredWords";
import { useWordStats } from "./hooks/useWordStats";
import type { ProgressMap, SortOption, ViewMode } from "./types/word";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@radix-ui/react-tooltip";

const words = wordsData.words;

function HomeContent() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");

  const categories = useMemo(
    () => [...new Set(words.map((word) => word.category))].sort(),
    []
  );

  // Load progress whenever the session changes
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

        const wordProgress = await WordService.getProgress();
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
    selectedCategory,
    progress,
    sortBy,
  });

  const stats = useWordStats({
    words,
    filteredWords,
    progress,
    categories,
  });

  const handleProgressChange = async (newProgress: ProgressMap) => {
    try {
      if (!session?.user) {
        // If no user is logged in, just update the local state
        setProgress(newProgress);
        return;
      }

      const changedWord = Object.keys(newProgress).find(
        (word) => newProgress[word] !== progress[word]
      );

      if (!changedWord) return;

      await WordService.updateProgress(
        session.user.id,
        changedWord,
        newProgress[changedWord]
      );

      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  if (isAuthLoading || loading) {
    return null; // Or a loading spinner
  }

  return (
    <main className="p-8">
      <div
        className={cn(
          "max-w-7xl mx-auto transition-opacity duration-500",
          loading ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex justify-between items-center mb-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <div className="inline-flex gap-2 items-center">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <TooltipProvider>
              <ArabicKeyboard />
              <ViewToggle current={view} onChange={setView} />
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Stats stats={stats} />
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
              counts={stats.byCategory}
            />
          </div>

          <div className="lg:col-span-3">
            <WordGrid
              words={filteredWords}
              view={view}
              progress={progress}
              onProgressChange={handleProgressChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthWrapper>
      <HomeContent />
    </AuthWrapper>
  );
}
