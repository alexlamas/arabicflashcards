import { useState } from "react";
import { Button } from "@/components/ui/button";

import SentenceGenerator from "./SentenceGenerator";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { Word } from "../types/word";
import WordMasteryRing from "./WordMasteryRing";
import { Plus } from "@phosphor-icons/react";

interface ProgressButtonsProps {
  word: Word & {
    progress?: {
      ease_factor: number;
      interval: number;
      review_count: number;
      next_review_date: string | null;
      success_rate: number;
    }[];
  };
  onProgressUpdate?: (updatedWord: Word) => void;
}

const ProgressButtons = ({ word, onProgressUpdate }: ProgressButtonsProps) => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLearning = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { count } = await SpacedRepetitionService.startLearning(
        session.user.id,
        word.english
      );
      const updatedWord = {
        ...word,
        status: "learning" as const,
        next_review_date: new Date().toISOString(),
      };
      onProgressUpdate?.(updatedWord);
      window.dispatchEvent(
        new CustomEvent("wordProgressUpdated", { detail: { count } })
      );
    } catch (error) {
      console.error("Error starting learning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  if (!word.progress?.[0]) {
    return (
      <div className="flex items-center gap-0 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartLearning}
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <SentenceGenerator
          word={{
            english: word.english,
            arabic: word.arabic,
          }}
        />
      </div>
    );
  }

  // Show the mastery ring for words being learned
  return (
    <div className="flex items-center gap-0 justify-end">
      <WordMasteryRing
        easeFactor={word.progress[0].ease_factor}
        interval={word.progress[0].interval}
        reviewCount={word.progress[0].review_count}
        lastReviewDate={word.progress[0].next_review_date}
        successRate={word.progress[0].success_rate}
      />
      <SentenceGenerator
        word={{
          english: word.english,
          arabic: word.arabic,
        }}
      />
    </div>
  );
};

export default ProgressButtons;
