import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CircleNotch, LightbulbFilament, X } from "@phosphor-icons/react";

interface HintButtonProps {
  word: {
    english: string;
    arabic: string;
  };
}

export default function HintButton({ word }: HintButtonProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const getHint = async () => {
    if (hint) {
      setIsVisible(!isVisible);
      return;
    }

    setLoading(true);
    setError(null);
    setIsVisible(true);

    try {
      const response = await fetch("/api/generate-hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          english: word.english,
          arabic: word.arabic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate hint");
      }

      const data = await response.json();
      setHint(data.hint);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate hint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 w-full flex flex-col">
      <Button
        variant="outline"
        size="sm"
        className="hover:text-amber-900 hover:border-amber-200 hover:bg-amber-50"
        onClick={getHint}
      >
        {loading ? (
          <CircleNotch className="mr-1 h-4 w-4 animate-spin" />
        ) : isVisible ? (
          <X className="mr-1 h-4 w-4" />
        ) : (
          <LightbulbFilament className="mr-1 h-4 w-4" />
        )}

        {!isVisible ? "Show hint" : "Hide hint"}
      </Button>

      {isVisible && !loading && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {error ? (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          ) : (
            <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
              <p className="text-sm leading-relaxed text-amber-900">{hint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
