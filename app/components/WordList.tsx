import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProgressButtons from "./ProgressButtons";

interface WordType {
  english: string;
  arabic: string;
  transliteration: string;
  category: string;
  type: string;
}

type ProgressType = "learned" | "learning" | "new";

interface WordListProps {
  words: WordType[];
  progress: Record<string, ProgressType>;
  onProgressChange: (value: Record<string, ProgressType>) => void;
}

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

const WordList = ({ words, progress, onProgressChange }: WordListProps) => {
  if (!words.length) {
    return (
      <div className="rounded-md border p-4 text-center text-muted-foreground">
        No words found.
      </div>
    );
  }

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
              <TableCell>{word.type}</TableCell>
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
};

export default WordList;
