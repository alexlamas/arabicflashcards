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

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
  onWordUpdate?: (updatedWord: Word) => void;
}

const TypeBadge = ({ type }: { type: string }) => (
  <span className="text-xs tracking-wide font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
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
  // All users can edit their own words
  const canEdit = !!session?.user;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const { handleOfflineAction } = useOfflineSync();
  const { handleWordDeleted } = useWords();

  // Fetch sentences when word changes
  useEffect(() => {
    if (word?.id && isOpen) {
      SentenceService.getSentencesForWord(word.id).then(setSentences);
    } else {
      setSentences([]);
    }
  }, [word?.id, isOpen]);

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
          <div className="absolute right-4 top-4 flex">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditOpen(true)}
                  title="Edit word"
                >
                  <PencilSimpleIcon weight="bold" />
                </Button>
                <EditWord
                  word={word}
                  onWordUpdate={handleWordUpdate}
                  open={isEditOpen}
                  onOpenChange={setIsEditOpen}
                />
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
            )}
            <DialogClose>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XIcon weight="bold" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Arabic and transliteration */}
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <div className="text-4xl font-arabic mb-3">{word.arabic}</div>
            <div className="text-lg text-gray-600">{word.transliteration}</div>
          </div>

          {/* Example Sentences */}
          {hasSentences && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Example Sentences
                <span className="text-sm font-normal bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {sentences.length}
                </span>
              </h3>
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
            <div
              className="relative text-center py-8 text-gray-500 hover:text-yellow-800 hover:border-yellow-400 group border border-dashed border-gray-300 rounded-lg  hover:bg-yellow-50 transition-colors cursor-pointer"
              onClick={() => canEdit && setIsEditOpen(true)}
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
                {canEdit
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
