import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phrase } from "../types/phrase";
import {
  PencilSimpleIcon,
  TrashSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { EditPhrase } from "./EditPhrase";
import { useAuth } from "../contexts/AuthContext";
import { DialogClose } from "@radix-ui/react-dialog";
import { PhraseService } from "../services/phraseService";

interface PhraseDetailModalProps {
  phrase: Phrase | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedPhrase: Phrase) => void;
  onDelete?: () => void;
}

const LinkedWordItem = ({
  word,
}: {
  word: { id: string; english: string; arabic: string };
}) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
    <span className="text-sm font-medium text-blue-900">{word.english}</span>
    {word.arabic && (
      <>
        <span className="text-blue-300">•</span>
        <span className="text-sm text-blue-700 font-arabic">{word.arabic}</span>
      </>
    )}
  </div>
);

export function PhraseDetailModal({
  phrase,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: PhraseDetailModalProps) {
  const { session } = useAuth();
  // All users can edit their own phrases
  const canEdit = !!session?.user;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!phrase) return null;

  const hasLinkedWords = phrase.linked_words && phrase.linked_words.length > 0;
  const hasNotes = !!phrase.notes;

  const handleDelete = async () => {
    if (!canEdit || !phrase.id) return;

    setIsDeleting(true);
    try {
      await PhraseService.deletePhrase(phrase.id);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting phrase:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePhraseUpdate = (updatedPhrase: Phrase) => {
    onUpdate?.(updatedPhrase);
    setIsEditOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-normal tracking-tight">
                Phrase Details
              </DialogTitle>
              <div className="flex items-center">
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsEditOpen(true)}
                    >
                      <PencilSimpleIcon weight="bold" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashSimpleIcon weight="bold" />
                    </Button>
                  </>
                )}
                <DialogClose asChild>
                  <Button variant="ghost" size="icon">
                    <XIcon weight="bold" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* English */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                English
              </h3>
              <p className="text-lg">{phrase.english}</p>
            </div>

            {/* Arabic */}
            {phrase.arabic && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Arabic
                </h3>
                <p className="text-2xl font-arabic">{phrase.arabic}</p>
              </div>
            )}

            {/* Transliteration */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Transliteration
              </h3>
              <p className="text-lg text-gray-600">{phrase.transliteration}</p>
            </div>

            {/* Notes */}
            {hasNotes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Notes
                </h3>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{phrase.notes}</p>
                </div>
              </div>
            )}

            {/* Linked Words */}
            {hasLinkedWords && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  Linked Words
                </h3>
                <div className="flex flex-wrap gap-2">
                  {phrase.linked_words!.map((word) => (
                    <LinkedWordItem key={word.id} word={word} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isEditOpen && (
        <EditPhrase
          phrase={phrase}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdate={handlePhraseUpdate}
        />
      )}
    </>
  );
}
