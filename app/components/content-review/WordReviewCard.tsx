"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import type { Word, Sentence } from "@/app/types/word";
import { SentenceReviewCard } from "./SentenceReviewCard";

interface WordReviewCardProps {
  word: Word & { sentences: Sentence[] };
  onApprove: (updates: Partial<Word>) => Promise<void>;
  onUnapprove: () => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  onSentenceApprove: (sentenceId: string, updates: Partial<Sentence>) => Promise<void>;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
}

const WORD_TYPES = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "particle",
  "phrase",
] as const;

export function WordReviewCard({
  word,
  onApprove,
  onUnapprove,
  onPrevious,
  onNext,
  onSentenceApprove,
  hasPrevious,
  hasNext,
  currentIndex,
  totalCount,
}: WordReviewCardProps) {
  const [arabic, setArabic] = useState(word.arabic);
  const [english, setEnglish] = useState(word.english);
  const [transliteration, setTransliteration] = useState(word.transliteration);
  const [type, setType] = useState<string>(word.type);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const arabicRef = useRef<HTMLInputElement>(null);

  // Reset form when word changes
  useEffect(() => {
    setArabic(word.arabic);
    setEnglish(word.english);
    setTransliteration(word.transliteration);
    setType(word.type);
    // Focus arabic field when word changes
    arabicRef.current?.focus();
  }, [word.id, word.arabic, word.english, word.transliteration, word.type]);

  const handleApprove = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<Word> = {};
      if (arabic !== word.arabic) updates.arabic = arabic;
      if (english !== word.english) updates.english = english;
      if (transliteration !== word.transliteration) updates.transliteration = transliteration;
      if (type !== word.type) updates.type = type;
      await onApprove(updates);
    } finally {
      setIsSubmitting(false);
    }
  }, [arabic, english, transliteration, type, word, onApprove, isSubmitting]);

  // Global keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if we're in a select dropdown
      if (e.target instanceof HTMLSelectElement) return;

      // Enter to approve (when not in textarea)
      if (e.key === "Enter" && !e.shiftKey && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        handleApprove();
      }

      // Up/Down arrows to move between fields
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const inputs = Array.from(document.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]), select, textarea, [role="combobox"]'
        )).filter(el => !(el as HTMLInputElement).disabled);

        const currentIdx = inputs.findIndex(el => el === document.activeElement);
        if (currentIdx !== -1) {
          e.preventDefault();
          const nextIdx = e.key === "ArrowDown"
            ? Math.min(currentIdx + 1, inputs.length - 1)
            : Math.max(currentIdx - 1, 0);
          inputs[nextIdx]?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleApprove]);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            Word {currentIndex + 1} of {totalCount}
          </span>
          {word.reviewed_at && (
            <button
              onClick={onUnapprove}
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
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onNext}
            disabled={!hasNext}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      </div>

      {/* Word card */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Arabic */}
          <div className="space-y-2">
            <Label htmlFor="arabic">Arabic</Label>
            <Input
              ref={arabicRef}
              id="arabic"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
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
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
            />
          </div>

          {/* Transliteration */}
          <div className="space-y-2">
            <Label htmlFor="transliteration">Transliteration</Label>
            <Input
              id="transliteration"
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
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

          {/* Action button */}
          <div className="pt-4">
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="w-full"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : word.reviewed_at ? "Update (Enter)" : "Approve (Enter)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sentences */}
      {word.sentences.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Example sentences ({word.sentences.length})
          </h3>
          {word.sentences.map((sentence) => (
            <SentenceReviewCard
              key={sentence.id}
              sentence={sentence}
              onApprove={(updates) => onSentenceApprove(sentence.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="text-xs text-muted-foreground text-center">
        <span>↑ ↓  move between fields</span>
        <span className="mx-2">·</span>
        <span>Enter to approve</span>
      </div>
    </div>
  );
}
