import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, Quotes, X } from "@phosphor-icons/react";
import { ExampleSentence } from "../../types/word";

interface SentenceButtonProps {
  word: {
    english: string;
    arabic: string;
    example_sentences?: ExampleSentence[];
  };
}

export default function SentenceButton({ word }: SentenceButtonProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedSentence, setGeneratedSentence] = useState<{
    arabic: string;
    english: string;
    transliteration: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const hasSavedSentences = word.example_sentences && word.example_sentences.length > 0;
  const currentSentence = hasSavedSentences 
    ? word.example_sentences![currentIndex]
    : generatedSentence;

  const getSentence = async () => {
    // If we have saved sentences, just toggle visibility or cycle through them
    if (hasSavedSentences) {
      if (isVisible) {
        // Cycle to next sentence or hide if at the end
        if (currentIndex < word.example_sentences!.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsVisible(false);
          setCurrentIndex(0);
        }
      } else {
        setIsVisible(true);
      }
      return;
    }

    // If no saved sentences and we already generated one, just toggle visibility
    if (generatedSentence) {
      setIsVisible(!isVisible);
      return;
    }

    // Generate new sentence if none saved and none generated yet
    setLoading(true);
    setError(null);
    setIsVisible(true);

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
      setGeneratedSentence(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate example sentence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Loading...";
    if (!isVisible) return hasSavedSentences ? "Show saved examples" : "Show example";
    if (hasSavedSentences && word.example_sentences!.length > 1) {
      return `Example ${currentIndex + 1} of ${word.example_sentences!.length}`;
    }
    return "Hide example";
  };

  return (
    <div className="space-y-3 w-full flex-col flex">
      <Button
        variant="outline"
        size="sm"
        className="hover:text-violet-900 hover:border-violet-200 hover:bg-violet-50 "
        onClick={getSentence}
      >
        {loading ? (
          <CircleNotch className="mr-1 h-4 w-4 animate-spin" />
        ) : isVisible ? (
          <X className="mr-1 h-4 w-4" />
        ) : (
          <Quotes className="mr-1 h-4 w-4" />
        )}

        {getButtonText()}
      </Button>

      {isVisible && (currentSentence || error) && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {error ? (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          ) : (
            <div className="p-3 bg-violet-50 rounded-md border border-violet-100 font-medium">
              {currentSentence && (
                <>
                  <p className="text-3xl font-arabic text-black/90 mb-2 font-medium">
                    {currentSentence.arabic}
                  </p>
                  <p className="text-sm text-black/50 ">
                    {currentSentence.transliteration}
                  </p>
                  <div className="h-[0.5px] w-full bg-black/10 my-2"></div>
                  <p className="text-sm text-black mt-2">{currentSentence.english}</p>
                  {hasSavedSentences && (
                    <p className="text-xs text-violet-600 mt-2">Saved example</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
