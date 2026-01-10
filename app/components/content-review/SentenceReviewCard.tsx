"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle2 } from "lucide-react";
import type { Sentence } from "@/app/types/word";

interface SentenceReviewCardProps {
  sentence: Sentence;
  onApprove: (updates: Partial<Sentence>) => Promise<void>;
  onUnapprove?: () => Promise<void>;
}

export function SentenceReviewCard({ sentence, onApprove, onUnapprove }: SentenceReviewCardProps) {
  const [arabic, setArabic] = useState(sentence.arabic);
  const [english, setEnglish] = useState(sentence.english);
  const [transliteration, setTransliteration] = useState(sentence.transliteration);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReviewed = !!sentence.reviewed_at;

  // Reset form when sentence changes
  useEffect(() => {
    setArabic(sentence.arabic);
    setEnglish(sentence.english);
    setTransliteration(sentence.transliteration);
  }, [sentence.id, sentence.arabic, sentence.english, sentence.transliteration]);

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<Sentence> = {};
      if (arabic !== sentence.arabic) updates.arabic = arabic;
      if (english !== sentence.english) updates.english = english;
      if (transliteration !== sentence.transliteration) updates.transliteration = transliteration;
      await onApprove(updates);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Status indicator */}
        {isReviewed && (
          <div className="flex justify-end">
            <button
              onClick={onUnapprove}
              className="inline-flex items-center gap-1.5 text-emerald-600 bg-green-50 px-2 py-1 pr-3 rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Click to unapprove"
            >
              <CheckCircle2 className="size-3" />
              Approved
            </button>
          </div>
        )}

        {/* Arabic */}
        <div className="space-y-1.5">
          <Label htmlFor={`arabic-${sentence.id}`} className="text-xs">Arabic</Label>
          <Input
            id={`arabic-${sentence.id}`}
            value={arabic}
            onChange={(e) => setArabic(e.target.value)}
            dir="rtl"
            className="font-arabic !text-2xl text-right h-12"
          />
        </div>

        {/* English */}
        <div className="space-y-1.5">
          <Label htmlFor={`english-${sentence.id}`} className="text-xs">English</Label>
          <Input
            id={`english-${sentence.id}`}
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
          />
        </div>

        {/* Transliteration */}
        <div className="space-y-1.5">
          <Label htmlFor={`translit-${sentence.id}`} className="text-xs">Transliteration</Label>
          <Input
            id={`translit-${sentence.id}`}
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
          />
        </div>

        {/* Action button */}
        <div className="pt-2">
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : isReviewed ? "Update" : "Approve"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
