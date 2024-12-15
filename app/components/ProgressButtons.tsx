import { useState } from "react";
import { Button } from "@/components/ui/button";

import SentenceGenerator from "./SentenceGenerator";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { Word } from "../types/word";
import WordMasteryRing from "./WordMasteryRing";
import { Plus } from "@phosphor-icons/react";
import { useWords } from "../contexts/WordsContext";

const ProgressButtons = ({ word }: { word: Word }) => {
  const { session } = useAuth();
  const { progress } = useWords();
  const [isLoading, setIsLoading] = useState(false);

  const wordProgress = progress[word.english];

  const handleStartLearning = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      await SpacedRepetitionService.startLearning(
        session.user.id,
        word.english
      );
      window.dispatchEvent(new CustomEvent("wordProgressUpdated"));
    } catch (error) {
      console.error("Error starting learning:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  if (!wordProgress) {
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
        <SentenceGenerator word={word} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 justify-end">
      <WordMasteryRing
        easeFactor={wordProgress.ease_factor}
        interval={wordProgress.interval}
        reviewCount={wordProgress.review_count}
        lastReviewDate={wordProgress.next_review_date ?? undefined}
        successRate={wordProgress.success_rate}
      />
      <SentenceGenerator word={word} />
    </div>
  );
};

export default ProgressButtons;
