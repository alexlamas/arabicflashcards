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
import { Archive, Plus } from "@phosphor-icons/react";
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

  const handleArchive = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const updatedWord = {
        ...word,
        status: "archived" as const,
      };
      
      await handleOfflineAction(
        async () => {
          // Archive the word
          const { count } = await SpacedRepetitionService.markAsArchived(
            session.user.id,
            word.english
          );
          window.dispatchEvent(
            new CustomEvent("wordProgressUpdated", { detail: { count } })
          );
          return count;
        },
        () => offlineHelpers.markAsArchived(session.user.id, word.english)
      );
      
      onProgressUpdate?.(updatedWord);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async () => {
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

  const isArchived = word.status === "archived";

  return (
    <div className="flex items-center gap-0 justify-end">
      <TooltipProvider delayDuration={100}>
        {isArchived ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnarchive}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Learn</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleArchive}
                disabled={isLoading}
              >
                <Archive className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive word</TooltipContent>
          </Tooltip>
        )}
        <SentenceGenerator word={{ english: word.english, arabic: word.arabic }} />
      </TooltipProvider>
    </div>
  );
};

export default ProgressButtons;
