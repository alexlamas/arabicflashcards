import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpacedRepetitionService } from "../services/spacedRepetitionService";
import { useAuth } from "../contexts/AuthContext";
import { Word } from "../types/word";

export function Review() {
  const { session } = useAuth();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNextWord = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    setError(null);
    try {
      const words = await SpacedRepetitionService.getDueWords(
        session.user.id,
        1
      );
      setCurrentWord(words?.[0] || null);
      setIsFlipped(false);
    } catch (error) {
      console.error("Error loading word:", error);
      setError("Failed to load words. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Load the first word when component mounts

  useEffect(() => {
    loadNextWord();
  }, [loadNextWord]);

  const handleRating = async (rating: number) => {
    if (!session?.user || !currentWord) return;

    try {
      await SpacedRepetitionService.processReview(
        session.user.id,
        currentWord.english,
        rating
      );
      await loadNextWord();
    } catch (error) {
      console.error("Error saving review:", error);
      setError("Failed to save review. Please try again.");
    }
  };

  if (!session) {
    return <div>Please log in to review words.</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadNextWord}>Try Again</Button>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">All caught up!</h2>
        <p>No words to review right now.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <Card
        className="p-6 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <CardContent className="min-h-[200px] flex items-center justify-center">
          {!isFlipped ? (
            <h3 className="text-2xl font-semibold">{currentWord.english}</h3>
          ) : (
            <div className="text-center">
              <div className="text-3xl font-arabic mb-2">
                {currentWord.arabic}
              </div>
              <div className="text-sm text-gray-600">
                {currentWord.transliteration}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isFlipped && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            onClick={() => handleRating(0)}
            className="bg-red-50 hover:bg-red-100"
          >
            Again
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRating(1)}
            className="bg-orange-50 hover:bg-orange-100"
          >
            Hard
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRating(2)}
            className="bg-green-50 hover:bg-green-100"
          >
            Good
          </Button>
          <Button
            variant="outline"
            onClick={() => handleRating(3)}
            className="bg-emerald-50 hover:bg-emerald-100"
          >
            Easy
          </Button>
        </div>
      )}
    </div>
  );
}
