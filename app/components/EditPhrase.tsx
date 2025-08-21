import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner, Plus, X } from "@phosphor-icons/react";
import { Phrase } from "../types/phrase";
import { Word } from "../types/word";
import { PhraseService } from "../services/phraseService";
import { WordService } from "../services/wordService";

interface EditPhraseProps {
  phrase: Phrase;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPhrase: Phrase) => void;
}

export function EditPhrase({
  phrase,
  isOpen,
  onClose,
  onUpdate,
}: EditPhraseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<Partial<Phrase>>({
    english: phrase.english,
    arabic: phrase.arabic || "",
    transliteration: phrase.transliteration,
    notes: phrase.notes || "",
  });

  useEffect(() => {
    loadWords();
    // Set initial selected words
    if (phrase.linked_words) {
      setSelectedWordIds(phrase.linked_words.map((w) => w.id));
    }
  }, [phrase]);

  const loadWords = async () => {
    try {
      const words = await WordService.getAllWords();
      setAllWords(words);
    } catch (error) {
      console.error("Error loading words:", error);
    }
  };

  const filteredWords = allWords.filter((word) => {
    const term = searchTerm.toLowerCase();
    const isAlreadySelected = selectedWordIds.includes(word.id!);
    return (
      !isAlreadySelected &&
      (word.english.toLowerCase().includes(term) ||
        word.arabic?.toLowerCase().includes(term) ||
        word.transliteration?.toLowerCase().includes(term))
    );
  });

  const handleAddWord = (wordId: string) => {
    setSelectedWordIds([...selectedWordIds, wordId]);
    setSearchTerm("");
  };

  const handleRemoveWord = (wordId: string) => {
    setSelectedWordIds(selectedWordIds.filter((id) => id !== wordId));
  };

  const hasChanges = () => {
    const originalWordIds = phrase.linked_words?.map((w) => w.id) || [];
    const wordIdsChanged =
      JSON.stringify(selectedWordIds.sort()) !==
      JSON.stringify(originalWordIds.sort());

    return (
      formData.english !== phrase.english ||
      formData.arabic !== (phrase.arabic || "") ||
      formData.transliteration !== phrase.transliteration ||
      formData.notes !== (phrase.notes || "") ||
      wordIdsChanged
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!phrase.id) throw new Error("Phrase ID is required");

      // Update the phrase
      await PhraseService.updatePhrase(phrase.id, formData);

      // Update word links if changed
      const originalWordIds = phrase.linked_words?.map((w) => w.id) || [];
      const toAdd = selectedWordIds.filter(
        (id) => !originalWordIds.includes(id)
      );
      const toRemove = originalWordIds.filter(
        (id) => !selectedWordIds.includes(id)
      );

      for (const wordId of toAdd) {
        await PhraseService.linkPhraseToWord(phrase.id, wordId);
      }

      for (const wordId of toRemove) {
        await PhraseService.unlinkPhraseFromWord(phrase.id, wordId);
      }

      // Get the updated phrase with linked words
      const finalPhrase = await PhraseService.getPhraseById(phrase.id);
      if (finalPhrase) {
        onUpdate(finalPhrase);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update phrase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-8">
        <DialogHeader className="p-1">
          <DialogTitle>Edit Phrase</DialogTitle>
          <DialogDescription>
            Update the phrase details and manage linked words
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto max-h-[calc(80vh-8rem)] p-1"
        >
          <div>
            <label className="text-sm font-medium">English</label>
            <Input
              value={formData.english}
              onChange={(e) =>
                setFormData({ ...formData, english: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Arabic (optional)</label>
            <Input
              value={formData.arabic}
              onChange={(e) =>
                setFormData({ ...formData, arabic: e.target.value })
              }
              className="font-arabic text-xl"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Transliteration</label>
            <Input
              value={formData.transliteration}
              onChange={(e) =>
                setFormData({ ...formData, transliteration: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium mb-2 block">
              Linked Words
            </label>

            {/* Selected words */}
            {selectedWordIds.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedWordIds.map((wordId) => {
                  const word = allWords.find((w) => w.id === wordId);
                  if (!word) return null;
                  return (
                    <div
                      key={wordId}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {word.english}
                        </span>
                        <span className="text-sm text-gray-500 font-arabic">
                          {word.arabic}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveWord(wordId)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search for words to add */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for words to link..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && filteredWords.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-[100]">
                  {filteredWords.slice(0, 5).map((word) => (
                    <button
                      key={word.id}
                      type="button"
                      className="w-full text-left p-2 hover:bg-gray-50 flex items-center justify-between"
                      onClick={() => handleAddWord(word.id!)}
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {word.english}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {word.transliteration}
                        </span>
                      </div>
                      <Plus size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !hasChanges()}>
              {loading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Phrase"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
