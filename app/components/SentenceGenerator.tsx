import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleNotch, MagicWand } from "@phosphor-icons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SentenceGeneratorProps {
  word: {
    english: string;
    arabic: string;
  };
}

interface GeneratedSentence {
  english: string;
  arabic: string;
  transliteration: string;
}

export default function SentenceGenerator({ word }: SentenceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sentence, setSentence] = useState<GeneratedSentence | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSentence = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: word.arabic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sentence");
      }

      const data = await response.json();
      setSentence(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate sentence. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-black/5 w-9 p-1"
              onClick={(e) => e.stopPropagation()}
            >
              <MagicWand className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Generate a sentence</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Example sentence with &quot;{word.arabic}&quot;
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {!sentence && !isGenerating && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Generate an example sentence using this word in context
              </p>
              <Button onClick={generateSentence}>Generate</Button>
            </div>
          )}

          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <CircleNotch className="h-8 w-8 animate-spin text-primary/70" />
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 text-sm">{error}</div>
          )}

          {sentence && !isGenerating && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-lg font-arabic">{sentence.arabic}</div>
                <div className="text-sm text-muted-foreground">
                  {sentence.transliteration}
                </div>
                <div className="text-sm">{sentence.english}</div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setSentence(null);
                  generateSentence();
                }}
                className="w-full"
              >
                Generate Another
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
