import { TooltipProvider } from "@/components/ui/tooltip";
import SentenceGenerator from "./SentenceGenerator";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  type: string;
}

interface ProgressButtonsProps {
  word: WordType;
}

const ProgressButtons = ({ word }: ProgressButtonsProps) => {
  return (
    <div className="flex items-center gap-0 justify-end">
      <TooltipProvider delayDuration={100}>
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
