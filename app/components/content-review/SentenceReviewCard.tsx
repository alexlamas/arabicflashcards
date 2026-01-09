"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Pencil, X } from "lucide-react";
import type { Sentence } from "@/app/types/word";
import { Badge } from "@/components/ui/badge";

interface SentenceReviewCardProps {
  sentence: Sentence;
  onApprove: (updates: Partial<Sentence>) => Promise<void>;
}

export function SentenceReviewCard({ sentence, onApprove }: SentenceReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [arabic, setArabic] = useState(sentence.arabic);
  const [english, setEnglish] = useState(sentence.english);
  const [transliteration, setTransliteration] = useState(sentence.transliteration);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReviewed = !!sentence.reviewed_at;

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updates: Partial<Sentence> = {};
      if (arabic !== sentence.arabic) updates.arabic = arabic;
      if (english !== sentence.english) updates.english = english;
      if (transliteration !== sentence.transliteration) updates.transliteration = transliteration;
      await onApprove(updates);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setArabic(sentence.arabic);
    setEnglish(sentence.english);
    setTransliteration(sentence.transliteration);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleApprove();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (isReviewed && !isEditing) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-arabic text-lg text-right" dir="rtl">
                {sentence.arabic}
              </p>
              <p className="text-sm text-muted-foreground">{sentence.transliteration}</p>
              <p className="text-sm">{sentence.english}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              <Check className="h-3 w-3 mr-1" />
              Reviewed
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isEditing) {
    return (
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1 min-w-0">
              <p className="font-arabic text-lg text-right" dir="rtl">
                {sentence.arabic}
              </p>
              <p className="text-sm text-muted-foreground">{sentence.transliteration}</p>
              <p className="text-sm">{sentence.english}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleApprove} disabled={isSubmitting}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Editing mode
  return (
    <Card className="border-primary">
      <CardContent className="py-3 px-4 space-y-2" onKeyDown={handleKeyDown}>
        <div className="space-y-1">
          <Input
            value={arabic}
            onChange={(e) => setArabic(e.target.value)}
            dir="rtl"
            className="font-arabic text-right"
            placeholder="Arabic"
          />
        </div>
        <div className="space-y-1">
          <Input
            value={transliteration}
            onChange={(e) => setTransliteration(e.target.value)}
            placeholder="Transliteration"
          />
        </div>
        <div className="space-y-1">
          <Input
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="English"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleApprove} disabled={isSubmitting}>
            <Check className="h-4 w-4 mr-1" />
            {isSubmitting ? "Saving..." : "Approve (Ctrl+Enter)"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
