"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useUserRoles } from "../../hooks/useUserRoles";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarterPack } from "../../services/starterPackService";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { WordReviewCard } from "../../components/content-review/WordReviewCard";
import {
  ContentReviewService,
  WordWithSentences,
} from "../../services/contentReviewService";
import type { Word, Sentence } from "../../types/word";

export default function ContentEditorPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const { isReviewer, isLoading: isRolesLoading } = useUserRoles();
  const router = useRouter();

  const [packs, setPacks] = useState<StarterPack[]>([]);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [words, setWords] = useState<WordWithSentences[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, reviewed: 0 });

  // Redirect non-reviewers
  useEffect(() => {
    if (!isAuthLoading && !isRolesLoading) {
      if (!session || !isReviewer) {
        router.push("/");
      }
    }
  }, [session, isReviewer, isAuthLoading, isRolesLoading, router]);

  // Load packs
  useEffect(() => {
    if (isReviewer) {
      loadPacks();
    }
  }, [isReviewer]);

  // Load content when pack selected
  useEffect(() => {
    if (selectedPack) {
      loadPackContent(selectedPack);
    }
  }, [selectedPack]);

  async function loadPacks() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading packs:", error);
      return;
    }
    setPacks(data || []);
    if (data && data.length > 0 && !selectedPack) {
      setSelectedPack(data[0].id);
    }
  }

  async function loadPackContent(packId: string) {
    setIsLoading(true);
    setCurrentIndex(0);

    try {
      // Get unreviewed words with sentences
      const unreviewedWords = await ContentReviewService.getUnreviewedWords(packId);
      setWords(unreviewedWords);

      // Get stats
      const packStats = await ContentReviewService.getPackWordCount(packId);
      setStats(packStats);
    } catch (error) {
      console.error("Error loading content:", error);
      setWords([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApprove = useCallback(
    async (updates: Partial<Word>) => {
      const currentWord = words[currentIndex];
      if (!currentWord) return;

      try {
        await ContentReviewService.updateAndApproveWord(currentWord.id, updates);

        // Remove from list and move to next
        const newWords = words.filter((_, i) => i !== currentIndex);
        setWords(newWords);

        // Update stats
        setStats((prev) => ({ ...prev, reviewed: prev.reviewed + 1 }));

        // Adjust index if needed
        if (currentIndex >= newWords.length && newWords.length > 0) {
          setCurrentIndex(newWords.length - 1);
        }
      } catch (error) {
        console.error("Error approving word:", error);
      }
    },
    [words, currentIndex]
  );

  const handleSkip = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, words.length]);

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

        // Update local state to mark sentence as reviewed
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

  // Loading state
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
  const progressPercent = stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b shadow-xs px-4 sticky top-0 backdrop-blur-lg bg-white/70 z-30">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="font-semibold">Content Review</h1>

        <div className="ml-4">
          <Select value={selectedPack || ""} onValueChange={setSelectedPack}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select pack" />
            </SelectTrigger>
            <SelectContent>
              {packs.map((pack) => (
                <SelectItem key={pack.id} value={pack.id}>
                  {pack.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {stats.reviewed} / {stats.total} reviewed
          </div>
          <div className="w-32">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </header>

      <div className="p-4 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : words.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">All done!</h2>
            <p className="text-muted-foreground">
              All words in this pack have been reviewed.
            </p>
          </div>
        ) : currentWord ? (
          <WordReviewCard
            word={currentWord}
            onApprove={handleApprove}
            onSkip={handleSkip}
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
    </>
  );
}
