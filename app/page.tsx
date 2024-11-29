// app/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import wordsData from "./data/words.json";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { WordGrid } from "./components/WordGrid";
import { Stats } from "./components/Stats";
import { ViewToggle } from "./components/ViewToggle";
import { AuthWrapper } from "./components/AuthWrapper";
import { supabase } from "./supabase";
import type { WordProgress } from "./supabase";
import ArabicKeyboard from "./components/ArabicKeyboard";
import { SortDropdown } from "./components/SortDropdown";

type ProgressState = "learned" | "learning" | "new";
type ProgressMap = Record<string, ProgressState>;

const words = wordsData.words;

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"list" | "flashcard">("list");
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  // Load progress from Supabase
  useEffect(() => {
    async function loadProgress() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError.message);
          setLoading(false);
          return;
        }

        if (!user) {
          console.log("No authenticated user");
          setLoading(false);
          return;
        }

        const { data, error: dbError } = await supabase
          .from("word_progress")
          .select("word_english, status");

        if (dbError) {
          console.error("Database error:", dbError.message);
          setLoading(false);
          return;
        }

        if (!data) {
          console.log("No data returned");
          setLoading(false);
          return;
        }

        const progressMap: ProgressMap = {};
        data.forEach((item: WordProgress) => {
          progressMap[item.word_english] = item.status as ProgressState;
        });

        setProgress(progressMap);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  // Handle progress changes
  const handleProgressChange = async (newProgress: ProgressMap) => {
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) return;

    // Find the changed word
    const changedWord = Object.keys(newProgress).find(
      (word) => newProgress[word] !== progress[word]
    );

    if (!changedWord) return;

    // Update in Supabase
    const { error } = await supabase.from("word_progress").upsert({
      user_id: user.id,
      word_english: changedWord,
      status: newProgress[changedWord],
    });

    if (error) {
      console.error("Error saving progress:", error);
      return;
    }

    setProgress(newProgress);
  };

  const categories = useMemo(
    () => [...new Set(words.map((word) => word.category))].sort(),
    []
  );

  const sortWords = (words: typeof wordsData.words) => {
    return [...words].sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.english.localeCompare(b.english);
        case "progress":
          const progressOrder = { learned: 0, learning: 1, new: 2 };
          const aProgress = progress[a.english] || "new";
          const bProgress = progress[b.english] || "new";
          return progressOrder[aProgress] - progressOrder[bProgress];
        case "type":
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };
  const [sortBy, setSortBy] = useState<"alphabetical" | "progress" | "type">(
    "alphabetical"
  );

  const filteredWords = useMemo(() => {
    return sortWords(
      words.filter((word) => {
        const matchesCategory =
          !selectedCategory || word.category === selectedCategory;
        const matchesSearch =
          !searchTerm ||
          word.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          word.arabic.includes(searchTerm) ||
          word.transliteration.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    );
  }, [selectedCategory, searchTerm, words, sortBy, progress]);

  const stats = useMemo(
    () => ({
      total: words.length,
      filtered: filteredWords.length,
      learned: Object.values(progress).filter((p) => p === "learned").length,
      learning: Object.values(progress).filter((p) => p === "learning").length,
      new: words.length - Object.values(progress).length,
      byCategory: categories.reduce(
        (acc, cat) => ({
          ...acc,
          [cat]: words.filter((w) => w.category === cat).length,
        }),
        {} as Record<string, number>
      ),
    }),
    [categories, filteredWords.length, progress, words]
  );

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
