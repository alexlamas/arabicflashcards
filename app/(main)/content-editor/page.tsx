"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserRoles } from "../../hooks/useUserRoles";
import { useRouter } from "next/navigation";
import { StarterPack } from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { WordReviewCard } from "../../components/content-review/WordReviewCard";
import {
  ContentReviewService,
  WordWithSentences,
} from "../../services/contentReviewService";
import type { Word, Sentence } from "../../types/word";
import { cn } from "@/lib/utils";

interface PackWithStats extends StarterPack {
  total: number;
  reviewed: number;
}

export default function ContentEditorPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isReviewer, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();

  const [packs, setPacks] = useState<PackWithStats[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithSentences[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const filter = "all";

  // Redirect non-reviewers
  useEffect(() => {
    if (!isAuthLoading && !isRolesLoading) {
      if (!session || !isReviewer) {
        router.push("/");
      }
    }
  }, [session, isReviewer, isAuthLoading, isRolesLoading, router]);

  // Load packs with stats
  useEffect(() => {
    if (isReviewer) {
      loadPacksWithStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewer]);

  // Load content when pack changes
  useEffect(() => {
    if (selectedPack) {
      loadPackContent(selectedPack, filter);
    }
  }, [selectedPack, filter]);

  async function loadPacksWithStats() {
    setIsLoadingPacks(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading packs:", error);
      setIsLoadingPacks(false);
      return;
    }

    // Load stats for each pack
    const packsWithStats: PackWithStats[] = await Promise.all(
      (data || []).map(async (pack) => {
        const stats = await ContentReviewService.getPackWordCount(pack.id);
        return { ...pack, ...stats };
      })
    );

    setPacks(packsWithStats);
    if (packsWithStats.length > 0 && !selectedPack) {
      setSelectedPack(packsWithStats[0].id);
    }
    setIsLoadingPacks(false);
  }

  async function loadPackContent(packId: string, wordFilter: "unreviewed" | "reviewed" | "all") {
    setIsLoading(true);
    setCurrentIndex(0);

    try {
      const filteredWords = await ContentReviewService.getWords(packId, wordFilter);
      setWords(filteredWords);
    } catch (error) {
      console.error("Error loading content:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }

  const updatePackStats = (packId: string, delta: number) => {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === packId ? { ...p, reviewed: p.reviewed + delta } : p
      )
    );
  };

  const handleApprove = useCallback(
    async (updates: Partial<Word>) => {
      const currentWord = words[currentIndex];
      if (!currentWord || !selectedPack) return;

      try {
        await ContentReviewService.updateAndApproveWord(currentWord.id, updates);

        const wasNewlyApproved = !currentWord.reviewed_at;
        setWords((prev) =>
          prev.map((w, i) =>
            i === currentIndex
              ? { ...w, ...updates, reviewed_at: new Date().toISOString() }
              : w
          )
        );

        if (wasNewlyApproved) {
          updatePackStats(selectedPack, 1);
        }

        if (currentIndex < words.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } catch (error) {
        console.error("Error approving word:", error);
      }
    },
    [words, currentIndex, selectedPack]
  );

  const handleUnapprove = useCallback(async () => {
    const currentWord = words[currentIndex];
    if (!currentWord || !selectedPack) return;

    try {
      await ContentReviewService.unapproveWord(currentWord.id);

      setWords((prev) =>
        prev.map((w, i) =>
          i === currentIndex
            ? { ...w, reviewed_at: null, reviewed_by: null }
            : w
        )
      );

      updatePackStats(selectedPack, -1);
    } catch (error) {
      console.error("Error unapproving word:", error);
    }
  }, [words, currentIndex, selectedPack]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, words.length]);

  const handleSentenceApprove = useCallback(
    async (sentenceId: string, updates: Partial<Sentence>) => {
      try {
        await ContentReviewService.updateAndApproveSentence(sentenceId, updates);

        setWords((prev) =>
          prev.map((word) => ({
            ...word,
            sentences: word.sentences.map((s) =>
              s.id === sentenceId
                ? { ...s, ...updates, reviewed_at: new Date().toISOString() }
                : s
            ),
          }))
        );
      } catch (error) {
        console.error("Error approving sentence:", error);
      }
    },
    []
  );

  if (isAuthLoading || isRolesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!session || !isReviewer) {
    return null;
  }

  const currentWord = words[currentIndex];
  const selectedPackData = packs.find((p) => p.id === selectedPack);

  return (
    <div className="flex h-screen">
      {/* Left Panel - Pack List */}
      <div className="w-72 border-r bg-gray-50/50 overflow-y-auto shrink-0 relative z-0">
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <h1 className="font-semibold">Content Review</h1>
        </div>

        {isLoadingPacks ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="p-2 space-y-1 isolate">
            {packs.map((pack) => {
              const progressPercent = pack.total > 0 ? (pack.reviewed / pack.total) * 100 : 0;
              const isComplete = pack.reviewed === pack.total && pack.total > 0;

              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors border",
                    selectedPack === pack.id
                      ? "bg-white shadow-sm border-gray-200"
                      : "border-transparent hover:bg-white/60"
                  )}
                >
                  {pack.image_url ? (
                    <img
                      src={pack.image_url}
                      alt={pack.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl shrink-0">
                      {pack.icon || "📦"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{pack.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {pack.reviewed}/{pack.total} reviewed
                    </div>
                    <div className="mt-1.5 relative z-0">
                      <Progress
                        value={progressPercent}
                        className={cn("h-1.5", isComplete && "[&>div]:bg-green-500")}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Panel - Review UI */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-3xl mx-auto">
          {selectedPackData && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold">{selectedPackData.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedPackData.reviewed} of {selectedPackData.total} words approved
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : words.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground">No words in this pack.</p>
            </div>
          ) : currentWord ? (
            <WordReviewCard
              word={currentWord}
              onApprove={handleApprove}
              onUnapprove={handleUnapprove}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSentenceApprove={handleSentenceApprove}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < words.length - 1}
              currentIndex={currentIndex}
              totalCount={words.length}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
