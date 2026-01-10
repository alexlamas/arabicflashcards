"use client";

import { useState, useEffect, useCallback } from "react";
import { StarterPack } from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { WordReviewCard } from "../content-review/WordReviewCard";
import {
  ContentReviewService,
  WordWithSentences,
} from "../../services/contentReviewService";
import type { Word, Sentence } from "../../types/word";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface PackWithStats extends StarterPack {
  total: number;
  reviewed: number;
}

export function ContentReviewTab() {
  const { toast } = useToast();

  const [packs, setPacks] = useState<PackWithStats[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithSentences[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [isPackSelectorOpen, setIsPackSelectorOpen] = useState(false);
  const filter = "all";

  // Load packs with stats
  useEffect(() => {
    loadPacksWithStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPackContent = useCallback(async (packId: string, wordFilter: "unreviewed" | "reviewed" | "all") => {
    setIsLoading(true);
    setCurrentIndex(0);

    try {
      const filteredWords = await ContentReviewService.getWords(packId, wordFilter);
      setWords(filteredWords);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load content",
      });
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load content when pack changes
  useEffect(() => {
    if (selectedPack) {
      loadPackContent(selectedPack, filter);
    }
  }, [selectedPack, filter, loadPackContent]);

  async function loadPacksWithStats() {
    setIsLoadingPacks(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .order("name");

    if (error) {
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
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to approve word",
        });
      }
    },
    [words, currentIndex, selectedPack, toast]
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
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to unapprove word",
      });
    }
  }, [words, currentIndex, selectedPack, toast]);

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
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to approve sentence",
        });
      }
    },
    [toast]
  );

  const currentWord = words[currentIndex];
  const selectedPackData = packs.find((p) => p.id === selectedPack);

  const renderPackItem = (pack: PackWithStats, isSelected: boolean = false) => {
    const progressPercent = pack.total > 0 ? (pack.reviewed / pack.total) * 100 : 0;
    const isComplete = pack.reviewed === pack.total && pack.total > 0;

    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        isSelected ? "bg-gray-50" : ""
      )}>
        {pack.image_url ? (
          <Image
            src={pack.image_url}
            alt={pack.name}
            width={48}
            height={48}
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
          <div className="mt-1.5">
            <Progress
              value={progressPercent}
              className={cn("h-1.5", isComplete && "[&>div]:bg-green-500")}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6">
      {/* Pack Selector Dropdown */}
      <div className="mb-6">
        <Popover open={isPackSelectorOpen} onOpenChange={setIsPackSelectorOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-80 justify-between h-auto py-2 px-3"
              disabled={isLoadingPacks}
            >
              {isLoadingPacks ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading packs...</span>
                </div>
              ) : selectedPackData ? (
                <div className="flex items-center gap-3 flex-1">
                  {selectedPackData.image_url ? (
                    <Image
                      src={selectedPackData.image_url}
                      alt={selectedPackData.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-xl shrink-0">
                      {selectedPackData.icon || "📦"}
                    </div>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium text-sm">{selectedPackData.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {selectedPackData.reviewed}/{selectedPackData.total} reviewed
                    </div>
                  </div>
                </div>
              ) : (
                <span>Select a pack</span>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <div className="max-h-80 overflow-y-auto space-y-1">
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => {
                    setSelectedPack(pack.id);
                    setIsPackSelectorOpen(false);
                  }}
                  className={cn(
                    "w-full rounded-lg hover:bg-gray-50 transition-colors",
                    selectedPack === pack.id && "bg-gray-50"
                  )}
                >
                  {renderPackItem(pack, selectedPack === pack.id)}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Review UI */}
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
  );
}
