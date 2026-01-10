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
import { useToast } from "@/hooks/use-toast";

interface SentenceGeneratorProps {
  word: {
    english: string;
    arabic: string;
    type?: string;
    notes?: string;
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
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
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
            english: word.english,
            type: word.type,
            notes: word.notes,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate sentence");
        }

        const data = await response.json();
        setSentence(data);
      } catch {
        setError("Failed to generate sentence. Please try again.");
        toast({
          variant: "destructive",
          title: "Failed to generate sentence",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    if (isOpen && !sentence && !isGenerating) {
      generateSentence();
    }
  }, [isOpen, sentence, isGenerating, word, setError, setSentence, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-black/5 w-9 p-1 border-[0.5px] border-violet-600/20 bg-gradient-to-t from-violet-500/10 to-violet-400/5 ml-1 group shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <MagicWand className="w-4 h-4 text-violet-600" />
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

        <div className="relative min-h-28">
          <div
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              isGenerating ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative ">
              <div className="absolute inset-[-30px] rounded-full bg-gradient-to-r from-violet-600/50 via-fuchsia-500/50 to-violet-600/50 animate-[pulse_2s_ease-in-out_infinite] blur-2xl" />
              <div className="absolute inset-[-20px] rounded-full bg-gradient-to-r from-violet-400/40 via-fuchsia-400/40 to-violet-400/40 animate-[pulse_2s_ease-in-out_infinite_500ms] blur-xl" />
              <div className="relative bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent animate-[pulse_2s_ease-in-out_infinite_1000ms]">
                <CircleNotch className="h-16 w-16 animate-spin" />
              </div>
            </div>
          </div>

          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-red-500 text-sm">{error}</div>
            </div>
          )}

          <div
            className={`transition-opacity duration-800 my-2 ${
              sentence && !isGenerating ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-3xl font-arabic">{sentence?.arabic}</div>
                <div className="text-sm text-muted-foreground">
                  {sentence?.transliteration}
                </div>
                <div className="text-sm font-medium">{sentence?.english}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
