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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CircleNotchIcon, Stack } from "@phosphor-icons/react";
import { Word, WordType } from "../types/word";

interface BulkAddWordsDialogProps {
  onWordsAdded: (words: Word[]) => void;
}

export default function BulkAddWordsDialog({
  onWordsAdded,
}: BulkAddWordsDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewWords, setPreviewWords] = useState<Partial<Word>[] | null>(
    null
  );

  const wordTypes: WordType[] = ["noun", "verb", "adjective", "phrase"];

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      // Split input by newlines or commas
      const lines = inputText
        .split(/[\n,]+/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setError("Please enter at least one word");
        setIsGenerating(false);
        return;
      }

      const response = await fetch("/api/words/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          words: lines,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate translations");
      }

      const words = await response.json();
      setPreviewWords(words);
    } catch (err) {
      setError("Error: " + err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewWords || previewWords.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/words/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          words: previewWords,
          confirmed: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save words");
      }

      const savedWords = await response.json();
      onWordsAdded(savedWords);
      setOpen(false);
      setInputText("");
      setPreviewWords(null);
    } catch (err) {
      setError("Error saving: " + err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInputText("");
    setPreviewWords(null);
    setError(null);
  };

  const updateWord = (index: number, field: keyof Word, value: string) => {
    setPreviewWords((prev) => {
      if (!prev) return prev;
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeWord = (index: number) => {
    setPreviewWords((prev) => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Stack weight="bold" />
          <span className="hidden text-sm sm:block">Bulk add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Add Words</DialogTitle>
          <DialogDescription>
            {!previewWords
              ? "Paste multiple words (one per line or comma-separated) to add them all at once."
              : `Review and edit ${previewWords.length} word${previewWords.length !== 1 ? "s" : ""} before saving.`}
          </DialogDescription>
        </DialogHeader>

        {!previewWords ? (
          // Step 1: Input multiple words and generate translations
          <div className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!isGenerating && inputText.trim()) {
                  handleGenerate();
                }
              }}
            >
              <Textarea
                placeholder="Paste your words here (one per line or comma-separated)&#10;Example:&#10;house&#10;tree&#10;car"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isGenerating}
                className="min-h-[200px]"
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
                    <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  "Generate Translations"
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Review and edit translations
          <div className="space-y-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {previewWords.map((word, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-3 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWord(index)}
                    className="absolute top-2 right-2 h-6 px-2 text-xs"
                  >
                    Remove
                  </Button>
                  <div className="grid gap-3 pr-20">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        English
                      </label>
                      <Input
                        placeholder="English"
                        value={word.english || ""}
                        onChange={(e) =>
                          updateWord(index, "english", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Arabic
                      </label>
                      <Input
                        placeholder="Arabic"
                        value={word.arabic || ""}
                        onChange={(e) =>
                          updateWord(index, "arabic", e.target.value)
                        }
                        dir="rtl"
                        className="font-arabic text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Transliteration
                      </label>
                      <Input
                        placeholder="Transliteration"
                        value={word.transliteration || ""}
                        onChange={(e) =>
                          updateWord(index, "transliteration", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Type
                      </label>
                      <Select
                        value={word.type}
                        onValueChange={(value) => updateWord(index, "type", value)}
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
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPreviewWords(null)}
                disabled={isSaving}
              >
                Back
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || previewWords.length === 0}>
                {isSaving ? (
                  <>
                    <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${previewWords.length} Word${previewWords.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
