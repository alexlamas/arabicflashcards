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
import { Word } from "../types/word";
import { WordService } from "../services/wordService";
import { Button } from "@/components/ui/button";
import { Trash } from "@phosphor-icons/react";

interface WordListProps {
  words: Word[];
  onWordDeleted?: () => void;
}

const WordList = ({ words, onWordDeleted }: WordListProps) => {
  const handleDelete = async (wordId: string | undefined) => {
    if (!wordId) return;
    try {
      await WordService.deleteWord(wordId);
      onWordDeleted?.();
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

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
            <TableRow key={word.english}>
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
                  <ProgressButtons word={word} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                    onClick={() => handleDelete(word.id)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete word</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WordList;
