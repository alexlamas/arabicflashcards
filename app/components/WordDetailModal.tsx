import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Word } from "../types/word";
import { WordNotes } from "./WordNotes";
import { X, Archive, Plus, Trash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EditWord } from "./EditWord";
import { useAuth } from "../contexts/AuthContext";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { DialogClose } from "@radix-ui/react-dialog";
import { WordService } from "../services/wordService";
import { useWords } from "../contexts/WordsContext";

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onWordUpdate?: (updatedWord: Word) => void;
}

const TypeBadge = ({ type }: { type: string }) => (
  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
    {type}
  </span>
);

export function WordDetailModal({
  word,
  isOpen,
  onClose,
  onWordUpdate,
}: WordDetailModalProps) {
  const { session } = useAuth();
  const isAdmin = session?.user.email === "lamanoujaim@gmail.com";
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleOfflineAction } = useOfflineSync();
  const { handleWordDeleted } = useWords();

  if (!word) return null;

  const hasSentences =
    word.example_sentences && word.example_sentences.length > 0;
  const hasNotes = !!word.notes;
  const isArchived = word.status === "archived";

  const handleWordUpdate = (updatedWord: Word) => {
    if (onWordUpdate) {
      onWordUpdate(updatedWord);
    }
  };

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

      handleWordUpdate(updatedWord);
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

      handleWordUpdate(updatedWord);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!word.id) return;

    setIsDeleting(true);
    try {
      await handleOfflineAction(
        () => WordService.deleteWord(word.id!),
        () => offlineHelpers.deleteWord(word.id!)
      );

      await handleWordDeleted(word.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete word:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      modal={true}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between pr-10">
          <div className="flex-1">
            <DialogTitle className="text-2xl font-semibold flex items-center gap-3">
              {word.english}
              <TypeBadge type={word.type} />
            </DialogTitle>
          </div>
          <div className="absolute right-4 top-4 flex gap-1">
            {session &&
              (isArchived ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUnarchive}
                  disabled={isLoading}
                  title="Unarchive word"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleArchive}
                  disabled={isLoading}
                  title="Archive word"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              ))}
            {isAdmin && (
              <>
                <EditWord word={word} onWordUpdate={handleWordUpdate} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  title="Delete word"
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
            <DialogClose>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Arabic and transliteration */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-arabic mb-3">{word.arabic}</div>
            <div className="text-lg text-gray-600">
              {word.transliteration}
            </div>
          </div>

          {/* Example Sentences */}
          {hasSentences && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Example Sentences
                <span className="text-sm font-normal bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {word.example_sentences!.length}
                </span>
              </h3>
              <div className="space-y-4">
                {word.example_sentences!.map((sentence, index) => (
                  <div
                    key={index}
                    className="bg-violet-50 rounded-lg p-5 border border-violet-100"
                  >
                    <div className="space-y-2">
                      <p className="text-2xl font-arabic text-black">
                        {sentence.arabic}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sentence.transliteration}
                      </p>
                      <p className="text-base text-black mt-2">
                        {sentence.english}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {hasNotes && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <WordNotes notes={word.notes!} />
            </div>
          )}

          {/* Empty state */}
          {!hasSentences && !hasNotes && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No example sentences or notes available</p>
              <p className="text-sm mt-1">
                Edit this word to add examples and notes
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
