import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Word } from "../types/word";
import { WordService } from "../services/wordService";
import { Button } from "@/components/ui/button";
import { Trash } from "@phosphor-icons/react";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { WordDetailModal } from "./WordDetailModal";
import { formatTimeUntilReview } from "../utils/formatReviewTime";

interface WordListProps {
  words: Word[];
  onWordDeleted?: (wordId?: string) => void;
  onWordUpdate?: (updatedWord: Word) => void;
}

const WordList = ({
  words,
  onWordDeleted,
  onWordUpdate = () => {},
}: WordListProps) => {
  const { handleOfflineAction } = useOfflineSync();
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (wordId: string | undefined) => {
    if (!wordId) return;
    
    await handleOfflineAction(
      () => WordService.deleteWord(wordId),
      () => offlineHelpers.deleteWord(wordId)
    );
    
    onWordDeleted?.(wordId);
  };

  const handleViewDetails = (word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
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
      <WordDetailModal 
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWordUpdate={(updatedWord) => {
          onWordUpdate?.(updatedWord);
          // Update the selected word if it's the one being edited
          if (selectedWord && selectedWord.id === updatedWord.id) {
            setSelectedWord(updatedWord);
          }
        }}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">English</TableHead>
            <TableHead>Arabic</TableHead>
            <TableHead>Transliteration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Next Review</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <TableRow 
              key={word.english} 
              className="hover:bg-black/[2%] cursor-pointer"
              onClick={() => handleViewDetails(word)}
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
                {formatTimeUntilReview(word.next_review_date) && (
                  <span className="text-sm text-gray-500">
                    {formatTimeUntilReview(word.next_review_date)}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end space-x-1">
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
