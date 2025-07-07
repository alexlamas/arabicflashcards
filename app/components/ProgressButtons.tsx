import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SentenceGenerator from "./SentenceGenerator";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { CheckCircle, Plus } from "@phosphor-icons/react";
import NextReviewBadge from "./review/NextReviewBadge";
import { Word } from "../types/word";

interface ProgressButtonsProps {
  word: Word;
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

  return (
    <div className=" flex items-center gap-0 justify-end">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={word.status === null ? handleStartLearning : undefined}
              disabled={isLoading || word.status !== null}
            >
              {word.status === null && <Plus className="w-4 h-4" />}
              {word.status === "learning" && word.next_review_date && (
                <NextReviewBadge nextReviewDate={word.next_review_date} />
              )}
              {word.status === "learned" && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {word.status === null && "Start learning"}
            {word.status === "learning" && "Time until next review"}
            {word.status === "learned" && "Word learned"}
          </TooltipContent>
        </Tooltip>

        <SentenceGenerator
          word={{
            english: word.english,
            arabic: word.arabic,
          }}
        />
      </TooltipProvider>
    </div>
  );
};

export default ProgressButtons;
