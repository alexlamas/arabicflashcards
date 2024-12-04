import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import SentenceGenerator from "./SentenceGenerator";
import { Button } from "@/components/ui/button";
import { Check, Spinner } from "@phosphor-icons/react";

type ProgressType = "learned" | "learning" | "new";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  type: string;
}

interface ProgressButtonsProps {
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}

const ProgressButtons = ({
  word,
  progress,
  onProgressChange,
}: ProgressButtonsProps) => {
  const handleProgress = (status: ProgressType) => {
    if (progress[word.english] === status) {
      onProgressChange({
        ...progress,
        [word.english]: "new",
      });
    } else {
      onProgressChange({
        ...progress,
        [word.english]: status,
      });
    }
  };

  return (
    <div className="flex items-center gap-0 justify-end">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              onClick={() => handleProgress("learned")}
              className={`p-1 w-9 ${
                progress[word.english] === "learned"
                  ? "text-emerald-800"
                  : "text-slate-500"
              }`}
              aria-label="Mark as learned"
            >
              <Check />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {progress[word.english] === "learned" ? "Reset" : "Mark as learned"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={"ghost"}
              onClick={() => handleProgress("learning")}
              className={`p-1 w-9  ${
                progress[word.english] === "learning"
                  ? "text-amber-600"
                  : "text-slate-500"
              }`}
              aria-label="Mark as still learning"
            >
              <Spinner />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {progress[word.english] === "learning"
              ? "Reset"
              : "Mark as learning"}
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
