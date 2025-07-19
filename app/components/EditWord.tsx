import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilSimple, Spinner } from "@phosphor-icons/react";
import { Word, WordType, ExampleSentence } from "../types/word";
import { WordService } from "../services/wordService";
import { useOfflineSync, offlineHelpers } from "../hooks/useOfflineSync";
import { ExampleSentenceManager } from "./ExampleSentenceManager";

interface EditWordProps {
  word: Word;
  onWordUpdate: (updatedWord: Word) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditWord({ word, onWordUpdate, open: controlledOpen, onOpenChange }: EditWordProps) {
  const { handleOfflineAction } = useOfflineSync();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  // Use controlled or uncontrolled pattern
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = onOpenChange || setUncontrolledOpen;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedSentences, setHasUnsavedSentences] = useState(false);
  const [formData, setFormData] = useState<Partial<Word>>({
    english: word.english,
    arabic: word.arabic,
    transliteration: word.transliteration,
    type: word.type,
    notes: word.notes || "",
    example_sentences: word.example_sentences || [],
  });

  const wordTypes: WordType[] = ["noun", "verb", "adjective", "phrase"];

  // Check if form has changes
  const hasChanges = () => {
    return (
      formData.english !== word.english ||
      formData.arabic !== word.arabic ||
      formData.transliteration !== word.transliteration ||
      formData.type !== word.type ||
      formData.notes !== (word.notes || "") ||
      JSON.stringify(formData.example_sentences) !== JSON.stringify(word.example_sentences || []) ||
      hasUnsavedSentences
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!word.id) throw new Error("Word ID is required");

      const updatedWord = await handleOfflineAction(
        () => WordService.updateWord(word.id!, { ...word, ...formData }),
        () => offlineHelpers.updateWord(word.id!, formData),
        { ...word, ...formData }
      );

      if (updatedWord) {
        onWordUpdate(updatedWord);
        setOpen(false);
        setHasUnsavedSentences(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update word");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <PencilSimple className="w-4 h-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
          <DialogDescription>
            Make changes to the word. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              placeholder="English"
              value={formData.english}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, english: e.target.value }))
              }
            />
            <Input
              placeholder={formData.type === "verb" ? "Arabic (3rd person past - he did)" : "Arabic"}
              value={formData.arabic}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, arabic: e.target.value }))
              }
              dir="rtl"
              className="font-arabic text-lg"
            />
            <Input
              placeholder="Transliteration"
              value={formData.transliteration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transliteration: e.target.value,
                }))
              }
            />

            <div className="grid w-full items-center gap-2">
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {wordTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add any notes or extra details about this word..."
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="min-h-[80px]"
              />
            </div>

            <ExampleSentenceManager
              sentences={formData.example_sentences || []}
              onChange={(sentences: ExampleSentence[]) =>
                setFormData((prev) => ({
                  ...prev,
                  example_sentences: sentences,
                }))
              }
              wordArabic={formData.arabic || word.arabic}
              wordEnglish={formData.english || word.english}
              wordType={formData.type || word.type}
              wordNotes={formData.notes || word.notes}
              onUnsavedChanges={setHasUnsavedSentences}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasChanges()}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
