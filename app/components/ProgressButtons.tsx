import { useEffect, useState } from "react";
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
import { supabase } from "../supabase";
import NextReviewBadge from "./NextReviewBadge";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  type: string;
}

interface WordProgress {
  status: WordStatus;
  next_review_date?: string;
}

interface ProgressButtonsProps {
  word: WordType;
}

type WordStatus = "learning" | "learned" | null;

const ProgressButtons = ({ word }: ProgressButtonsProps) => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<WordProgress | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("word_progress")
        .select("status, next_review_date")
        .eq("user_id", session.user.id)
        .eq("word_english", word.english)
        .maybeSingle();

      if (!error && data) {
        setProgress(data);
      }
    };

    fetchProgress();
  }, [session, word.english]);

  const handleStartLearning = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { count } = await SpacedRepetitionService.startLearning(
        session.user.id,
        word.english
      );
      const { data } = await supabase
        .from("word_progress")
        .select("status, next_review_date")
        .eq("user_id", session.user.id)
        .eq("word_english", word.english)
        .single();

      setProgress(data);
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
              onClick={progress === null ? handleStartLearning : undefined}
              disabled={isLoading || progress !== null}
            >
              {progress === null && <Plus className="w-4 h-4" />}
              {progress?.status === "learning" && progress.next_review_date && (
                <NextReviewBadge nextReviewDate={progress.next_review_date} />
              )}
              {progress?.status === "learned" && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {progress === null && "Start learning"}
            {progress?.status === "learning" && "Time until next review"}
            {progress?.status === "learned" && "Word learned"}
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
