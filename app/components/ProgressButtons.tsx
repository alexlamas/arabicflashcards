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
import { Book, CheckCircle, Plus } from "@phosphor-icons/react";
import { supabase } from "../supabase";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  type: string;
}

interface ProgressButtonsProps {
  word: WordType;
}

type WordStatus = "learning" | "learned" | null;

const ProgressButtons = ({ word }: ProgressButtonsProps) => {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<WordStatus>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Fetch the word's current status
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("word_progress")
        .select("status")
        .eq("user_id", session.user.id)
        .eq("word_english", word.english)
        .maybeSingle();

      if (!error && data) {
        setStatus(data.status);
      }
    };

    fetchStatus();
  }, [session, word.english]);

  const handleStartLearning = async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const { count } = await SpacedRepetitionService.startLearning(
        session.user.id,
        word.english
      );
      setStatus("learning");
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
    <div className="flex items-center gap-0 justify-between">
      <TooltipProvider delayDuration={100}>
        {/* Status/Learn Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={status === null ? handleStartLearning : undefined}
              disabled={isLoading || status !== null}
            >
              {status === null && <Plus className="w-4 h-4" />}
              {status === "learning" && (
                <Book className="w-4 h-4 text-amber-600" />
              )}
              {status === "learned" && (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {status === null && "Start learning"}
            {status === "learning" && "Currently learning"}
            {status === "learned" && "Word learned"}
          </TooltipContent>
        </Tooltip>

        {/* Sentence Generator */}
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
