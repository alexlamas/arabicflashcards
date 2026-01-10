"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { StarterPack } from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Loader2, ChevronDown, ChevronLeft, ChevronRight, Check, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PackWithStats extends StarterPack {
  total: number;
  reviewed: number;
}

type ReviewableItem =
  | { type: "word"; data: WordWithSentences }
  | { type: "sentence"; data: Sentence; parentWord: WordWithSentences };

const WORD_TYPES = ["noun", "verb", "adjective", "adverb", "pronoun", "particle", "phrase"] as const;

export function ContentReviewTab() {
  const { toast } = useToast();

  const [packs, setPacks] = useState<PackWithStats[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithSentences[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(true);
  const [isPackSelectorOpen, setIsPackSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filter = "all";

  // Form state
  const [formArabic, setFormArabic] = useState("");
  const [formEnglish, setFormEnglish] = useState("");
  const [formTransliteration, setFormTransliteration] = useState("");
  const [formType, setFormType] = useState("noun");

  // Flatten words and sentences into a single reviewable list
  const reviewableItems: ReviewableItem[] = useMemo(() => {
    const items: ReviewableItem[] = [];
    for (const word of words) {
      items.push({ type: "word", data: word });
      for (const sentence of word.sentences) {
        items.push({ type: "sentence", data: sentence, parentWord: word });
      }
    }
    return items;
  }, [words]);

  const currentItem = reviewableItems[currentIndex];

  // Update form when current item changes
  useEffect(() => {
    if (!currentItem) return;

    if (currentItem.type === "word") {
      setFormArabic(currentItem.data.arabic);
      setFormEnglish(currentItem.data.english);
      setFormTransliteration(currentItem.data.transliteration || "");
      setFormType(currentItem.data.type || "noun");
    } else {
      setFormArabic(currentItem.data.arabic);
      setFormEnglish(currentItem.data.english);
      setFormTransliteration(currentItem.data.transliteration || "");
    }
  }, [currentItem]);

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

  const handleApprove = useCallback(async () => {
    if (!currentItem || !selectedPack || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (currentItem.type === "word") {
        const updates: Partial<Word> = {};
        if (formArabic !== currentItem.data.arabic) updates.arabic = formArabic;
        if (formEnglish !== currentItem.data.english) updates.english = formEnglish;
        if (formTransliteration !== currentItem.data.transliteration) updates.transliteration = formTransliteration;
        if (formType !== currentItem.data.type) updates.type = formType;

        await ContentReviewService.updateAndApproveWord(currentItem.data.id, updates);

        const wasNewlyApproved = !currentItem.data.reviewed_at;
        setWords((prev) =>
          prev.map((w) =>
            w.id === currentItem.data.id
              ? { ...w, ...updates, reviewed_at: new Date().toISOString() }
              : w
          )
        );

        if (wasNewlyApproved) {
          updatePackStats(selectedPack, 1);
        }
      } else {
        const updates: Partial<Sentence> = {};
        if (formArabic !== currentItem.data.arabic) updates.arabic = formArabic;
        if (formEnglish !== currentItem.data.english) updates.english = formEnglish;
        if (formTransliteration !== currentItem.data.transliteration) updates.transliteration = formTransliteration;

        await ContentReviewService.updateAndApproveSentence(currentItem.data.id, updates);

        setWords((prev) =>
          prev.map((word) => ({
            ...word,
            sentences: word.sentences.map((s) =>
              s.id === currentItem.data.id
                ? { ...s, ...updates, reviewed_at: new Date().toISOString() }
                : s
            ),
          }))
        );
      }

      // Auto-advance to next
      if (currentIndex < reviewableItems.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } catch {
      toast({
        variant: "destructive",
        title: `Failed to approve ${currentItem.type}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [currentItem, selectedPack, isSubmitting, formArabic, formEnglish, formTransliteration, formType, currentIndex, reviewableItems.length, toast]);

  const handleUnapprove = useCallback(async () => {
    if (!currentItem || !selectedPack) return;

    try {
      if (currentItem.type === "word") {
        await ContentReviewService.unapproveWord(currentItem.data.id);
        setWords((prev) =>
          prev.map((w) =>
            w.id === currentItem.data.id
              ? { ...w, reviewed_at: null, reviewed_by: null }
              : w
          )
        );
        updatePackStats(selectedPack, -1);
      } else {
        await ContentReviewService.unapproveSentence(currentItem.data.id);
        setWords((prev) =>
          prev.map((word) => ({
            ...word,
            sentences: word.sentences.map((s) =>
              s.id === currentItem.data.id
                ? { ...s, reviewed_at: null, reviewed_by: null }
                : s
            ),
          }))
        );
      }
    } catch {
      toast({
        variant: "destructive",
        title: `Failed to unapprove ${currentItem.type}`,
      });
    }
  }, [currentItem, selectedPack, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLSelectElement) return;

      if (e.key === "Enter" && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleApprove();
      }

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        setCurrentIndex(currentIndex - 1);
      }

      if (e.key === "ArrowRight" && currentIndex < reviewableItems.length - 1) {
        e.preventDefault();
        setCurrentIndex(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleApprove, currentIndex, reviewableItems.length]);

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

  const isReviewed = currentItem?.type === "word"
    ? !!currentItem.data.reviewed_at
    : currentItem?.type === "sentence"
      ? !!currentItem.data.reviewed_at
      : false;

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
      ) : reviewableItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No content in this pack.</p>
        </div>
      ) : currentItem ? (
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{currentIndex + 1} of {reviewableItems.length}</span>
              {isReviewed && (
                <button
                  onClick={handleUnapprove}
                  className="inline-flex items-center gap-1.5 text-emerald-600 bg-green-50 px-2 py-1 pr-3 rounded-full text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Click to unapprove"
                >
                  <CheckCircle2 className="size-4" />
                  Approved
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex + 1)}
                disabled={currentIndex >= reviewableItems.length - 1}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Review Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Arabic */}
              <div className="space-y-2">
                <Label htmlFor="arabic">Arabic</Label>
                <Input
                  id="arabic"
                  value={formArabic}
                  onChange={(e) => setFormArabic(e.target.value)}
                  dir="rtl"
                  className="font-arabic !text-4xl text-right h-14"
                  autoFocus
                />
              </div>

              {/* English */}
              <div className="space-y-2">
                <Label htmlFor="english">English</Label>
                <Input
                  id="english"
                  value={formEnglish}
                  onChange={(e) => setFormEnglish(e.target.value)}
                />
              </div>

              {/* Transliteration */}
              <div className="space-y-2">
                <Label htmlFor="transliteration">Transliteration</Label>
                <Input
                  id="transliteration"
                  value={formTransliteration}
                  onChange={(e) => setFormTransliteration(e.target.value)}
                />
              </div>

              {/* Type - only for words */}
              {currentItem.type === "word" && (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action button */}
              <div className="pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : isReviewed ? "Update (Enter)" : "Approve (Enter)"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard shortcuts help */}
          <div className="text-xs text-muted-foreground text-center">
            <span>← → navigate</span>
            <span className="mx-2">·</span>
            <span>Enter to approve</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
