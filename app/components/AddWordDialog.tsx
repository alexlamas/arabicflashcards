import { useState, useEffect, useRef } from "react";
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
import { CircleNotchIcon, PlusIcon, WarningCircle, Package } from "@phosphor-icons/react";
import { Word, WordType } from "../types/word";
import { useAIUsage } from "../hooks/useAIUsage";
import { PackService, PackWord } from "../services/packService";

interface AddWordDialogProps {
  onWordAdded: (word: Word) => void;
}

export default function AddWordDialog({ onWordAdded }: AddWordDialogProps) {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [previewWord, setPreviewWord] = useState<Partial<Word> | null>(null);
  const [searchResults, setSearchResults] = useState<PackWord[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { usage, isUnlimited, refresh: refreshUsage } = useAIUsage();

  const wordTypes: WordType[] = ["noun", "verb", "adjective", "phrase"];

  // Debounced search for pack words
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!inputText || inputText.length < 2) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await PackService.searchPackWords(inputText, 5);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputText]);

  const handleSelectPackWord = (packWord: PackWord) => {
    setPreviewWord({
      english: packWord.english,
      arabic: packWord.arabic,
      transliteration: packWord.transliteration || "",
      type: packWord.type || "noun",
    });
    setSearchResults([]);
  };

  const handleGenerate = async () => {
    setError(null);
    setLimitReached(false);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          text: inputText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.limitReached) {
          setLimitReached(true);
          setError(errorData.error || "Monthly AI limit reached");
          return;
        }
        throw new Error(errorData.error || "Failed to generate translation");
      }

      const word = await response.json();
      setPreviewWord(word);
      refreshUsage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error generating translation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewWord) return;

    try {
      const requestBody = {
        text: previewWord.english,
        confirmed: true,
        word: previewWord,
      };

      const response = await fetch("/api/words/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Check for duplicate word error
        if (errorData.details?.includes("duplicate") || errorData.details?.includes("unique")) {
          setError("You already have this word in your vocabulary");
          return;
        }
        throw new Error(errorData.error || "Failed to save word");
      }

      const savedWord = await response.json();
      onWordAdded(savedWord);
      setOpen(false);
      setInputText("");
      setPreviewWord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save word");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInputText("");
    setPreviewWord(null);
    setError(null);
    setLimitReached(false);
    setSearchResults([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Clear state when opening
      setError(null);
      setLimitReached(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 rounded-full">
          <PlusIcon weight="bold" />
          <span className="hidden text-sm sm:block">New word</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New word</DialogTitle>
          <DialogDescription>
            {!previewWord
              ? "We'll translate it to Lebanese Arabic for you."
              : "Review and edit the translation before saving."}
          </DialogDescription>
        </DialogHeader>

        {!previewWord ? (
          // Step 1: Input word and generate translation
          <div className="space-y-4">
            <div className="relative">
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
                  onBlur={() => {
                    // Delay to allow click on dropdown items
                    setTimeout(() => setSearchResults([]), 150);
                  }}
                  disabled={isGenerating}
                />
              </form>

              {/* Pack word search results dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
                  <div className="px-3 py-1.5 bg-gray-50 border-b">
                    <span className="text-xs font-medium text-subtle">Found in packs</span>
                  </div>
                  <div className="divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((word) => (
                      <button
                        key={word.id}
                        type="button"
                        onClick={() => handleSelectPackWord(word)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <Package className="w-4 h-4 text-disabled flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-heading">{word.english}</span>
                            <span className="text-disabled">·</span>
                            <span className="font-arabic text-body">{word.arabic}</span>
                          </div>
                          {word.transliteration && (
                            <div className="text-xs text-subtle">{word.transliteration}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              limitReached ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-start gap-3">
                    <WarningCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" weight="fill" />
                    <div className="text-sm">
                      <p className="font-medium text-rose-800">Monthly limit reached</p>
                      <p className="text-rose-700 mt-1">
                        You&apos;ve used all your free AI translations this month. Your limit resets next month.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-500">{error}</p>
              )
            )}

            <div className="flex items-center justify-between gap-2">
              {usage && !isUnlimited && !limitReached && (
                <span className="text-xs text-muted-foreground">
                  {usage.count}/{usage.limit} AI uses this month
                </span>
              )}
              {!usage && <span />}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim() || limitReached}
                >
                  {isGenerating ? (
                    <>
                      <CircleNotchIcon className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
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
                <Button type="submit">Save word</Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
