import { useState } from "react";
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
import { CircleNotch, Plus } from "@phosphor-icons/react";
import { Word, WordType } from "../types/word";

interface AddWordDialogProps {
  onWordAdded: (word: Word) => void;
}

export default function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewWord, setPreviewWord] = useState<Partial<Word> | null>(null);

  const wordTypes: WordType[] = ["noun", "verb", "adjective", "phrase"];

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate translation");
      }

      const word = await response.json();
      setPreviewWord(word);
    } catch (err) {
      setError("Error: " + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewWord) return;

    try {
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: previewWord.english,
          confirmed: true,
          word: previewWord,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save word");
      }

      const savedWord = await response.json();
      onWordAdded(savedWord); // The complete word data is already here
      setOpen(false);
      setInputText("");
      setPreviewWord(null);
    } catch (err) {
      setError("Error saving: " + err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInputText("");
    setPreviewWord(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus />
          <span className="hidden sm:block">Add Word</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
          <DialogDescription>
            {!previewWord
              ? "Enter a word in English or Arabic to get started."
              : "Review and edit the translation before saving."}
          </DialogDescription>
        </DialogHeader>

        {!previewWord ? (
          // Step 1: Input word and generate translation
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isGenerating && inputText.trim()) {
                  handleGenerate();
                }
              }}
            >
              <Input
                placeholder="Enter word in English or Arabic..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isGenerating}
              />
            </form>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
              >
                {isGenerating ? (
                  <>
                    <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Generate Translation"
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Review and edit translation
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Input
                    placeholder="English"
                    value={previewWord.english}
                    onChange={(e) =>
                      setPreviewWord((prev) => ({
                        ...prev,
                        english: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Input
                    placeholder="Arabic"
                    value={previewWord.arabic}
                    onChange={(e) =>
                      setPreviewWord((prev) => ({
                        ...prev,
                        arabic: e.target.value,
                      }))
                    }
                    dir="rtl"
                    className="font-arabic text-lg"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Transliteration"
                    value={previewWord.transliteration}
                    onChange={(e) =>
                      setPreviewWord((prev) => ({
                        ...prev,
                        transliteration: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Select
                    value={previewWord.type}
                    onValueChange={(value) =>
                      setPreviewWord((prev) => ({ ...prev, type: value }))
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
                  onClick={() => setPreviewWord(null)}
                >
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Word</Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
