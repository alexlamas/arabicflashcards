import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, Quotes, X } from "@phosphor-icons/react";

interface SentenceButtonProps {
  word: {
    english: string;
    arabic: string;
  };
}

export default function SentenceButton({ word }: SentenceButtonProps) {
  const [sentence, setSentence] = useState<{
    arabic: string;
    english: string;
    transliteration: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getSentence = async () => {
    if (sentence) {
      setIsVisible(!isVisible);
      return;
    }

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
      setSentence(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate example sentence. Please try again.");
    } finally {
      setLoading(false);
    }
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

        {!isVisible || loading ? "Show example" : "Hide example"}
      </Button>

      {isVisible && (sentence || error) && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {error ? (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          ) : (
            <div className="p-3 bg-violet-50 rounded-md border border-violet-100 font-medium">
              {sentence && (
                <>
                  <p className="text-3xl font-arabic text-black/90 mb-2 font-medium">
                    {sentence.arabic}
                  </p>
                  <p className="text-sm text-black/50 ">
                    {sentence.transliteration}
                  </p>
                  <div className="h-[0.5px] w-full bg-black/10 my-2"></div>
                  <p className="text-sm text-black mt-2">{sentence.english}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
