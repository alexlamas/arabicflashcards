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
import { ProgressMap, Word } from "../types/word";

interface WordListProps {
  words: Word[];
  progress: ProgressMap;
  onProgressChange: (value: ProgressMap) => void;
}

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
            <TableHead>Tags</TableHead>
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
              <TableCell>
                {word.tags?.map((tag) => tag.name).join(", ")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <ProgressButtons
                    word={word}
                    progress={progress}
                    onProgressChange={onProgressChange}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const getProgressBackground = (progress: string | undefined) => {
  switch (progress) {
    case "learned":
      return "bg-emerald-50";
    case "learning":
      return "bg-amber-50";
    default:
      return "";
  }
};

export default WordList;
