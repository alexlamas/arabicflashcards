"use client";

import { useState, useEffect, useMemo } from "react";
import wordsData from "./data/words.json";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { WordGrid } from "./components/WordGrid";
import { Stats } from "./components/Stats";
import { ViewToggle } from "./components/ViewToggle";
import { AuthWrapper } from "./components/AuthWrapper";
import ArabicKeyboard from "./components/ArabicKeyboard";
import { SortDropdown } from "./components/SortDropdown";
import { WordService } from "./services/supabaseService";
import { useFilteredWords } from "./hooks/useFilteredWords";
import { useWordStats } from "./hooks/useWordStats";
import type { ProgressMap, SortOption, ViewMode } from "./types/word";

const words = wordsData.words;

export default function Home() {
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

  // Load progress from Supabase
  useEffect(() => {
    async function loadProgress() {
      try {
        setLoading(true);
        const wordProgress = await WordService.getProgress();
        const progressMap: ProgressMap = {};
        wordProgress.forEach((item) => {
          progressMap[item.word_english] = item.status;
        });
        setProgress(progressMap);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

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

  // Handle progress changes
  const handleProgressChange = async (newProgress: ProgressMap) => {
    try {
      const user = await WordService.getCurrentUser();
      if (!user) return;

      const changedWord = Object.keys(newProgress).find(
        (word) => newProgress[word] !== progress[word]
      );

      if (!changedWord) return;

      await WordService.updateProgress(
        user.id,
        changedWord,
        newProgress[changedWord]
      );

      setProgress(newProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <AuthWrapper>
      <main className="p-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Loading your progress...</div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <div className="inline-flex gap-2 items-center">
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <ArabicKeyboard />
                <ViewToggle current={view} onChange={setView} />
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
        )}
      </main>
    </AuthWrapper>
  );
}
