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
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";

interface ProgressButtonsProps {
  word: Word;
  onProgressUpdate?: (updatedWord: Word) => void;
}

const ProgressButtons = ({ word, onProgressUpdate }: ProgressButtonsProps) => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { handleOfflineAction } = useOfflineSync();

  const handleStartLearning = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const updatedWord = {
        ...word,
        status: "learning" as const,
        next_review_date: new Date().toISOString(),
      };
      
      await handleOfflineAction(
        async () => {
          const { count } = await SpacedRepetitionService.startLearning(
            session.user.id,
            word.english
          );
          window.dispatchEvent(
            new CustomEvent("wordProgressUpdated", { detail: { count } })
          );
          return count;
        },
        () => offlineHelpers.startLearning(session.user.id, word.english)
      );
      
      onProgressUpdate?.(updatedWord);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const getStatusContent = () => {
    if (word.status === null) {
      return { icon: <Plus className="w-4 h-4" />, tooltip: "Start learning" };
    }
    if (word.status === "learning") {
      return { 
        icon: word.next_review_date ? <NextReviewBadge nextReviewDate={word.next_review_date} /> : null, 
        tooltip: "Time until next review" 
      };
    }
    return { 
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />, 
      tooltip: "Word learned" 
    };
  };

  const statusContent = getStatusContent();

  return (
    <div className="flex items-center gap-0 justify-end">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={word.status === null ? handleStartLearning : undefined}
              disabled={isLoading || word.status !== null}
            >
              {statusContent.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{statusContent.tooltip}</TooltipContent>
        </Tooltip>
        <SentenceGenerator word={{ english: word.english, arabic: word.arabic }} />
      </TooltipProvider>
    </div>
  );
};

export default ProgressButtons;
