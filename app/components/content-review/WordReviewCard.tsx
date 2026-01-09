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
import { Check, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import type { Word, Sentence, WordType } from "@/app/types/word";
import { SentenceReviewCard } from "./SentenceReviewCard";

interface WordReviewCardProps {
  word: Word & { sentences: Sentence[] };
  onApprove: (updates: Partial<Word>) => Promise<void>;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSentenceApprove: (sentenceId: string, updates: Partial<Sentence>) => Promise<void>;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
}

const WORD_TYPES: WordType[] = ["noun", "verb", "adjective", "phrase"];

export function WordReviewCard({
  word,
  onApprove,
  onSkip,
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
  const [notes, setNotes] = useState(word.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const arabicRef = useRef<HTMLInputElement>(null);
  const englishRef = useRef<HTMLInputElement>(null);
  const transliterationRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLInputElement>(null);

  // Reset form when word changes
  useEffect(() => {
    setArabic(word.arabic);
    setEnglish(word.english);
    setTransliteration(word.transliteration);
    setType(word.type);
    setNotes(word.notes || "");
    // Focus arabic field when word changes
    arabicRef.current?.focus();
  }, [word.id, word.arabic, word.english, word.transliteration, word.type, word.notes]);

  const handleApprove = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<Word> = {};
      if (arabic !== word.arabic) updates.arabic = arabic;
      if (english !== word.english) updates.english = english;
      if (transliteration !== word.transliteration) updates.transliteration = transliteration;
      if (type !== word.type) updates.type = type;
      if (notes !== (word.notes || "")) updates.notes = notes;
      await onApprove(updates);
    } finally {
      setIsSubmitting(false);
    }
  }, [arabic, english, transliteration, type, notes, word, onApprove, isSubmitting]);

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

      // Escape to skip
      if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }

      // Arrow keys for navigation (when holding Alt)
      if (e.altKey && e.key === "ArrowLeft" && hasPrevious) {
        e.preventDefault();
        onPrevious();
      }
      if (e.altKey && e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleApprove, onSkip, onPrevious, onNext, hasPrevious, hasNext]);

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Word {currentIndex + 1} of {totalCount}
        </span>
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
              className="font-arabic text-2xl text-right"
              autoFocus
            />
          </div>

          {/* English */}
          <div className="space-y-2">
            <Label htmlFor="english">English</Label>
            <Input
              ref={englishRef}
              id="english"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
            />
          </div>

          {/* Transliteration */}
          <div className="space-y-2">
            <Label htmlFor="transliteration">Transliteration</Label>
            <Input
              ref={transliterationRef}
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

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              ref={notesRef}
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onSkip}
              disabled={isSubmitting}
              className="flex-1"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip (Esc)
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : "Approve (Enter)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sentences */}
      {word.sentences.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Example Sentences ({word.sentences.length})
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
      <div className="text-xs text-muted-foreground text-center space-x-4">
        <span>Tab: next field</span>
        <span>Enter: approve</span>
        <span>Esc: skip</span>
        <span>Alt+←/→: navigate</span>
      </div>
    </div>
  );
}
