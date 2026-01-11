import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Word, Sentence } from "../types/word";
import { WordNotes } from "./WordNotes";
import {
  NoteBlankIcon,
  PencilSimpleIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EditWord } from "./EditWord";
import { useAuth } from "../contexts/AuthContext";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { DialogClose } from "@radix-ui/react-dialog";
import { WordService } from "../services/wordService";
import { SentenceService } from "../services/sentenceService";
import { useWords } from "../contexts/WordsContext";
import { useToast } from "@/hooks/use-toast";

interface WordDetailModalProps {
  word: Word | null;
  sentences?: Sentence[];
  isOpen: boolean;
  onClose: () => void;
  onWordUpdate?: (updatedWord: Word) => void;
}

const TypeBadge = ({ type }: { type: string }) => (
  <span className="text-xs tracking-wide font-medium px-3 py-1 rounded-full bg-gray-100 text-body">
    {type}
  </span>
);

export function WordDetailModal({
  word,
  sentences: sentencesProp,
  isOpen,
  onClose,
  onWordUpdate,
}: WordDetailModalProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const isPackWord = !!word?.pack_id;
  // Users can add notes/examples to any word, but can only edit/delete custom words
  const canAddNotes = !!session?.user;
  const canEditWord = !!session?.user && !isPackWord;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [internalSentences, setInternalSentences] = useState<Sentence[]>([]);
  const [loadingSentences, setLoadingSentences] = useState(false);
  const { handleOfflineAction } = useOfflineSync();
  const { handleWordDeleted } = useWords();

  // Use prop if explicitly provided (even if empty), otherwise use internal state
  const sentences = sentencesProp !== undefined ? sentencesProp : internalSentences;

  // Only fetch sentences internally if prop is not provided (backwards compatibility)
  useEffect(() => {
    if (word?.id && isOpen && sentencesProp === undefined) {
      setLoadingSentences(true);
      SentenceService.getSentencesForWord(word.id)
        .then((fetched) => {
          setInternalSentences(fetched);
        })
        .finally(() => setLoadingSentences(false));
    }
  }, [word?.id, isOpen, sentencesProp]);

  if (!word) return null;
  const hasSentences = sentences.length > 0;
  const hasNotes = !!word.notes;

  const handleWordUpdate = (updatedWord: Word) => {
    if (onWordUpdate) {
      onWordUpdate(updatedWord);
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
      toast({
        title: "Word deleted",
      });
      onClose();
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to delete word",
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader className="space-y-3">
              {/* Row 1: Badge on left, actions on right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TypeBadge type={word.type} />
                  {isPackWord && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      From pack
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {canEditWord ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditOpen(true)}
                        title="Edit word"
                      >
                        <PencilSimpleIcon weight="bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        title="Delete word"
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <TrashSimpleIcon weight="bold" />
                      </Button>
                    </>
                  ) : canAddNotes && isPackWord && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditOpen(true)}
                      title="Add examples"
                    >
                      <PencilSimpleIcon weight="bold" />
                    </Button>
                  )}
                  {canAddNotes && (
                    <EditWord
                      word={word}
                      onWordUpdate={handleWordUpdate}
                      open={isEditOpen}
                      onOpenChange={setIsEditOpen}
                      isPackWord={isPackWord}
                    />
                  )}
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                      <XIcon weight="bold" />
                    </Button>
                  </DialogClose>
                </div>
              </div>
              {/* Row 2: Title */}
              <DialogTitle className="text-2xl font-semibold">
                {word.english}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-4">
          {/* Arabic and transliteration */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-arabic mb-3">{word.arabic}</div>
            <div className="text-lg text-body">{word.transliteration}</div>
          </div>

          {/* Example Sentences */}
          {hasSentences && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Example sentences</h3>
              <div className="space-y-4">
                {sentences.map((sentence) => (
                  <div
                    key={sentence.id}
                    className="bg-violet-50 rounded-lg p-5 border border-violet-100"
                  >
                    <div className="space-y-2">
                      {sentence.arabic && (
                        <p className="text-2xl font-arabic text-black">
                          {sentence.arabic}
                        </p>
                      )}
                      <p className="text-sm text-body">
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

          {/* Empty state - don't show while sentences are loading */}
          {!loadingSentences && !hasSentences && !hasNotes && (
            <div
              className="relative text-center py-8 text-subtle hover:text-yellow-800 hover:border-yellow-400 group border border-dashed border-gray-300 rounded-lg  hover:bg-yellow-50 transition-colors cursor-pointer"
              onClick={() => canAddNotes && setIsEditOpen(true)}
            >
              <NoteBlankIcon
                size={24}
                weight="fill"
                className="mx-auto mb-2 -rotate-6 text-gray-300 group-hover:text-yellow-500 group-hover:rotate-[16px] transition-all"
              />
              <NoteBlankIcon
                size={24}
                weight="duotone"
                className="absolute left-0 group-hover:left-[1rem] group-hover:text-yellow-500 right-1 top-[2.1rem] mx-auto mb-2 -rotate-6 group-hover:rotate-[18px] transition-all opacity-0 group-hover:opacity-20"
              />
              <NoteBlankIcon
                size={24}
                weight="duotone"
                className="absolute left-0 group-hover:left-[0.6rem] group-hover:text-yellow-500 right-1 top-[2.03rem] mx-auto mb-2 -rotate-6 group-hover:rotate-[24px] transition-all opacity-0 group-hover:opacity-20"
              />
              <p className="text-sm mt-1">
                {canAddNotes
                  ? "Click to add examples and notes"
                  : "Add examples and notes"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
