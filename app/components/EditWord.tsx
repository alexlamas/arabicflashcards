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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PencilSimple, Spinner } from "@phosphor-icons/react";
import { Word, WordType } from "../types/word";
import { WordService } from "../services/wordService";

interface EditWordProps {
  word: Word;
  onWordUpdate: (updatedWord: Word) => void;
}

export function EditWord({ word, onWordUpdate }: EditWordProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Word>>({
    english: word.english,
    arabic: word.arabic,
    transliteration: word.transliteration,
    type: word.type,
  });

  const wordTypes: WordType[] = ["noun", "verb", "adjective", "phrase"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!word.id) throw new Error("Word ID is required");

      const updatedWord = await WordService.updateWord(word.id, {
        ...word,
        ...formData,
      });

      onWordUpdate(updatedWord);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update word");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-black/5 w-8 h-8 p-0"
        >
          <PencilSimple className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Word</DialogTitle>
          <DialogDescription>
            Make changes to the word. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <Input
                placeholder="English"
                value={formData.english}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, english: e.target.value }))
                }
              />
            </div>

            <div className="grid w-full items-center gap-2">
              <Input
                placeholder="Arabic"
                value={formData.arabic}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, arabic: e.target.value }))
                }
                dir="rtl"
                className="font-arabic text-lg"
              />
            </div>

            <div className="grid w-full items-center gap-2">
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
            </div>

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
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
