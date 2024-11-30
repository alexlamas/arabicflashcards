import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, SmileyNervous } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SentenceGenerator from "./SentenceGenerator";
import { Badge } from "@/components/ui/badge";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  category: string;
  type: string;
}

type ProgressType = "learned" | "learning" | "new";

const ProgressButtons: React.FC<{
  word: WordType;
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}> = ({ word, progress, onProgressChange }) => {
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
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleProgress("learned")}
              className={`p-1.5 rounded-md transition hover:bg-black/5 ${
                progress[word.english] === "learned" && "text-emerald-800"
              }`}
              aria-label="Mark as learned"
            >
              <Check
                size={18}
                weight={
                  progress[word.english] === "learned" ? "bold" : "regular"
                }
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {progress[word.english] === "learned" ? "Reset" : "Mark as learned"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleProgress("learning")}
              className={`p-1.5 rounded-md transition hover:bg-black/5 ${
                progress[word.english] === "learning" && "text-amber-600"
              }`}
              aria-label="Mark as still learning"
            >
              <SmileyNervous
                size={18}
                weight={
                  progress[word.english] === "learning" ? "fill" : "regular"
                }
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
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

const getProgressBackground = (progress: ProgressType | undefined) => {
  switch (progress) {
    case "learned":
      return "bg-emerald-50";
    case "learning":
      return "bg-amber-50";
    default:
      return "";
  }
};

export function WordList({
  words,
  progress,
  onProgressChange,
}: {
  words: WordType[];
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">English</TableHead>
            <TableHead>Arabic</TableHead>
            <TableHead>Transliteration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow
              key={word.english}
              className={getProgressBackground(progress[word.english])}
            >
              <TableCell className="font-medium">{word.english}</TableCell>
              <TableCell className="font-arabic text-lg">
                {word.arabic}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {word.transliteration}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {word.type}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <ProgressButtons
                  word={word}
                  progress={progress}
                  onProgressChange={onProgressChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default WordList;
